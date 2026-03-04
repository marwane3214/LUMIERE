/**
 * supabaseAdmin.ts
 * All Supabase read/write operations used by the admin panel.
 * Uses the shared anon-key client — RLS policies must allow these
 * operations (see the SQL snippet in the README / chat history).
 */
import { supabase } from '@/lib/supabase';
import type { Product, Order, OrderItem } from '@/types';
import { sendOrderNotification } from '@/lib/telegram';

// ──────────────────────────────────────────────────────────────────────────
// Helper: map a raw Supabase row → Order (including nested items)
// ──────────────────────────────────────────────────────────────────────────
function rowToOrder(row: Record<string, unknown>): Order {
    const items = ((row.order_items as Record<string, unknown>[]) ?? []).map(
        (i): OrderItem => ({
            product_id: String(i.product_id ?? ''),
            product_name: String(i.product_name ?? ''),
            quantity: Number(i.quantity),
            price: Number(i.price),
            size: i.size ? String(i.size) : undefined,
        })
    );
    return {
        id: String(row.id),
        customer_name: String(row.customer_name),
        customer_phone: String(row.customer_phone),
        customer_address: String(row.customer_address),
        customer_city: String(row.customer_city),
        notes: row.notes ? String(row.notes) : undefined,
        items,
        total_price: Number(row.total_price),
        status: row.status as Order['status'],
        payment_method: 'cod',
        created_at: String(row.created_at),
    };
}

// ══════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════════════════

export async function sbGetProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[admin] getProducts:', error.message);
        return [];
    }
    return (data ?? []) as Product[];
}

export async function sbAddProduct(
    product: Omit<Product, 'id' | 'created_at'>
): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

    if (error) {
        console.error('[admin] addProduct:', error.message);
        return null;
    }
    return data as Product;
}

export async function sbUpdateProduct(
    id: string,
    updates: Partial<Omit<Product, 'id' | 'created_at'>>
): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[admin] updateProduct:', error.message);
        return null;
    }
    return data as Product;
}

export async function sbDeleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[admin] deleteProduct:', error.message);
        return false;
    }
    return true;
}

// ══════════════════════════════════════════════════════════════════════════
// ORDERS  (with nested order_items via Supabase join)
// ══════════════════════════════════════════════════════════════════════════

export async function sbGetOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[admin] getOrders:', error.message);
        return [];
    }
    return ((data ?? []) as Record<string, unknown>[]).map(rowToOrder);
}

export async function sbAddOrder(
    order: Omit<Order, 'id' | 'created_at'>
): Promise<Order | null> {
    // 1. Insert the order header
    const { data: orderRow, error: orderErr } = await supabase
        .from('orders')
        .insert([
            {
                customer_name: order.customer_name,
                customer_phone: order.customer_phone,
                customer_address: order.customer_address,
                customer_city: order.customer_city,
                notes: order.notes ?? null,
                total_price: order.total_price,
                status: order.status,
                payment_method: 'cod',
            },
        ])
        .select()
        .single();

    if (orderErr || !orderRow) {
        console.error('[admin] addOrder (header):', orderErr?.message);
        return null;
    }

    // 2. Insert line items
    const lineItems = order.items.map((item) => ({
        order_id: orderRow.id,
        product_id: item.product_id || null,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
    }));

    const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(lineItems);

    if (itemsErr) {
        console.error('[admin] addOrder (items):', itemsErr.message);
        // Order header was created — still return it without items
    }

    // 3. Re-fetch the full order with items
    const { data: full, error: fetchErr } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderRow.id)
        .single();

    if (fetchErr || !full) return null;
    const finalOrder = rowToOrder(full as Record<string, unknown>);

    // Send Telegram Notification
    sendOrderNotification(finalOrder).catch(err =>
        console.error('[telegram] Failed to send order notification:', err)
    );

    return finalOrder;
}

export async function sbUpdateOrderStatus(
    id: string,
    status: Order['status']
): Promise<boolean> {
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('[admin] updateOrderStatus:', error.message);
        return false;
    }
    return true;
}

export async function sbDeleteOrder(id: string): Promise<boolean> {
    // order_items will cascade-delete automatically
    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[admin] deleteOrder:', error.message);
        return false;
    }
    return true;
}

// ── Customer-facing: look up own orders by phone number ────────────────────
export async function sbGetOrdersByPhone(phone: string): Promise<Order[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[orders] getOrdersByPhone:', error.message);
        return [];
    }
    return ((data ?? []) as Record<string, unknown>[]).map(rowToOrder);
}

// ── Image Upload: Supabase Storage ────────────────────────────────────────
export async function sbUploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

    if (uploadError) {
        console.error('[storage] uploadImage:', uploadError.message);
        return null;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

    return publicUrl;
}


export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read';
    created_at: string;
}

export async function sbGetMessages(): Promise<ContactMessage[]> {
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[admin] getMessages:', error.message);
        return [];
    }
    return (data ?? []) as ContactMessage[];
}

export async function sbUpdateMessageStatus(id: string, status: ContactMessage['status']): Promise<boolean> {
    const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('[admin] updateMessageStatus:', error.message);
        return false;
    }
    return true;
}

export async function sbDeleteMessage(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[admin] deleteMessage:', error.message);
        return false;
    }
    return true;
}

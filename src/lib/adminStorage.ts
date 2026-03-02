import type { Product, Order } from '@/types';

const PRODUCTS_KEY = 'admin_products';
const ORDERS_KEY = 'admin_orders';

// ── Default seed products ──────────────────────────────────────────────────
const defaultProducts: Product[] = [
    {
        id: 'p1',
        name: 'Golden Rose Ring',
        name_fr: 'Bague Rose Dorée',
        name_ar: 'خاتم الوردة الذهبية',
        description: 'Delicate 18k gold ring shaped like a blooming rose. Timeless elegance.',
        description_fr: 'Bague en or 18k délicate en forme de rose épanouie. Élégance intemporelle.',
        description_ar: 'خاتم ذهب 18 قيراط على شكل وردة متفتحة. أناقة خالدة.',
        price: 890,
        image: '/product-ring.jpg',
        category: 'rings',
        featured: true,
        in_stock: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'p2',
        name: 'Diamond Pendant Necklace',
        name_fr: 'Collier Pendentif Diamant',
        name_ar: 'قلادة ماسية',
        description: 'Sterling silver necklace with a brilliant-cut diamond pendant. Perfect for any occasion.',
        description_fr: 'Collier en argent sterling avec un pendentif en diamant taille brillant.',
        description_ar: 'قلادة فضة استرلينية مع قلادة ماس مقطوعة ببريق رائع.',
        price: 1250,
        image: '/product-necklace.jpg',
        category: 'necklaces',
        featured: true,
        in_stock: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'p3',
        name: 'Pearl Drop Earrings',
        name_fr: 'Boucles d\'oreilles Perle',
        name_ar: 'أقراط لؤلؤ',
        description: 'Elegant freshwater pearl drop earrings set in 14k gold. A classic bridal choice.',
        description_fr: 'Élégantes boucles d\'oreilles pendantes en perles d\'eau douce serties en or 14k.',
        description_ar: 'أقراط فاخرة من اللؤلؤ الطبيعي بإطار ذهب 14 قيراط.',
        price: 650,
        image: '/product-earrings.jpg',
        category: 'earrings',
        featured: true,
        in_stock: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'p4',
        name: 'Gold Chain Bracelet',
        name_fr: 'Bracelet Chaîne en Or',
        name_ar: 'سوار سلسلة ذهبية',
        description: 'Minimalist 18k gold chain bracelet — stackable, light, and luxurious.',
        description_fr: 'Bracelet chaîne en or 18k minimaliste — superposable, léger et luxueux.',
        description_ar: 'سوار سلسلة ذهب 18 قيراط — قابل للتراكم، خفيف ورفيع.',
        price: 780,
        image: '/product-bracelet.jpg',
        category: 'bracelets',
        featured: false,
        in_stock: true,
        created_at: new Date().toISOString(),
    },
];

// ── Default seed orders ────────────────────────────────────────────────────
const defaultOrders: Order[] = [
    {
        id: 'ord-001',
        customer_name: 'Youssef Alami',
        customer_phone: '0612345678',
        customer_address: '12 Rue Hassan II, Apt 3',
        customer_city: 'Casablanca',
        items: [
            { product_id: 'p1', product_name: 'Golden Rose Ring', quantity: 1, price: 890 },
        ],
        total_price: 890,
        status: 'pending',
        payment_method: 'cod',
        notes: 'Please call before delivery.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'ord-002',
        customer_name: 'Fatima Zahra Benali',
        customer_phone: '0698765432',
        customer_address: '5 Avenue Mohammed V',
        customer_city: 'Marrakech',
        items: [
            { product_id: 'p2', product_name: 'Diamond Pendant Necklace', quantity: 1, price: 1250 },
            { product_id: 'p3', product_name: 'Pearl Drop Earrings', quantity: 1, price: 650 },
        ],
        total_price: 1900,
        status: 'confirmed',
        payment_method: 'cod',
        created_at: new Date(Date.now() - 172800000).toISOString(),
    },
];

// ── Product helpers ────────────────────────────────────────────────────────
export function getStoredProducts(): Product[] {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw) as Product[];
    // seed
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
}

export function saveProducts(products: Product[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, 'id' | 'created_at'>): Product {
    const products = getStoredProducts();
    const newProduct: Product = {
        ...product,
        id: `p${Date.now()}`,
        created_at: new Date().toISOString(),
    };
    saveProducts([newProduct, ...products]);
    return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = getStoredProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates };
    saveProducts(products);
    return products[idx];
}

export function deleteProduct(id: string): void {
    const products = getStoredProducts().filter((p) => p.id !== id);
    saveProducts(products);
}

// ── Order helpers ──────────────────────────────────────────────────────────
export function getStoredOrders(): Order[] {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw) as Order[];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(defaultOrders));
    return defaultOrders;
}

export function saveOrders(orders: Order[]): void {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function addOrder(order: Omit<Order, 'id' | 'created_at'>): Order {
    const orders = getStoredOrders();
    const newOrder: Order = {
        ...order,
        id: `ord-${Date.now()}`,
        created_at: new Date().toISOString(),
    };
    saveOrders([newOrder, ...orders]);
    return newOrder;
}

export function updateOrderStatus(id: string, status: Order['status']): Order | null {
    const orders = getStoredOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], status };
    saveOrders(orders);
    return orders[idx];
}

export function deleteOrder(id: string): void {
    const orders = getStoredOrders().filter((o) => o.id !== id);
    saveOrders(orders);
}

import type { Order } from '@/types';

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export async function sendOrderNotification(order: Order) {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('Telegram bot token or chat ID is missing. Notification not sent.');
        return;
    }

    const itemsList = order.items
        .map(
            (item) =>
                `• ${item.product_name} x${item.quantity}${item.size ? ` (Taille: ${item.size})` : ''
                } - ${item.price.toLocaleString()} DH`
        )
        .join('\n');

    const message = `
🛍️ *Nouvelle Commande !*

👤 *Client:* ${order.customer_name}
📞 *Téléphone:* ${order.customer_phone}
📍 *Ville:* ${order.customer_city}
🏠 *Adresse:* ${order.customer_address}

📦 *Articles:*
${itemsList}

💰 *Total:* ${order.total_price.toLocaleString()} DH
💬 *Notes:* ${order.notes || 'Aucune'}

---
🚀 _Félicitations pour cette nouvelle vente !_
  `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to send Telegram notification:', errorData);
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
}

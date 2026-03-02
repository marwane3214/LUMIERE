import { useTranslation } from 'react-i18next';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface CartDrawerProps {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { t } = useTranslation();
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-[#d4af37]/20 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-[#d4af37]" />
            <h2 className="font-display text-2xl text-white">
              {t('cart.title')}
            </h2>
            {totalItems > 0 && (
              <span className="px-2 py-1 bg-[#d4af37] text-black text-xs font-bold rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag className="w-16 h-16 text-white/20 mb-4" />
              <p className="font-body text-white/60 mb-6">
                {t('cart.empty')}
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-primary font-body text-sm tracking-[0.15em] uppercase"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedSize ?? ''}-${index}`}
                  className="flex gap-4 bg-white/5 rounded-lg p-4"
                >
                  {/* Image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-white truncate mb-1">
                      {item.product.name}
                    </h4>
                    {item.selectedSize && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-1" style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}>
                        Size {item.selectedSize}
                      </span>
                    )}
                    <p className="font-body text-[#d4af37] text-sm mb-3">
                      {item.product.price.toLocaleString()} DH
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)
                          }
                          className="w-7 h-7 flex items-center justify-center bg-white/10 rounded text-white/60 hover:bg-[#d4af37] hover:text-black transition-colors duration-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-body text-white w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)
                          }
                          className="w-7 h-7 flex items-center justify-center bg-white/10 rounded text-white/60 hover:bg-[#d4af37] hover:text-black transition-colors duration-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-white/40 hover:text-red-500 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="font-body text-white/60">
                {t('cart.subtotal')}
              </span>
              <span className="font-body text-white">
                {totalPrice.toLocaleString()} DH
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="font-display text-xl text-white">
                {t('cart.total')}
              </span>
              <span className="font-display text-2xl text-[#d4af37]">
                {totalPrice.toLocaleString()} DH
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                onCheckout();
              }}
              className="w-full btn-primary btn-glow font-body text-sm tracking-[0.15em] uppercase py-4"
            >
              {t('cart.checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

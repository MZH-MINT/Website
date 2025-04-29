import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface CartItemProps {
  item: {
    id: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: number | string;
      image: string;
      brand: string;
      stock: number;
    };
  };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const handleIncrease = () => {
    if (item.quantity < item.product.stock) {
      onUpdateQuantity(item.quantity + 1);
    }
  };
  
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.quantity - 1);
    }
  };
  
  const totalPrice = Number(item.product.price) * item.quantity;
  
  return (
    <div className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
      {/* Product Image */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <Link href={`/product/${item.product.id}`}>
          <img
            src={item.product.image}
            alt={item.product.name}
            className="h-full w-full object-cover object-center cursor-pointer"
          />
        </Link>
      </div>
      
      {/* Product Details */}
      <div className="ml-4 flex-1">
        <Link href={`/product/${item.product.id}`}>
          <h3 className="text-base font-medium text-gray-900 hover:text-primary-700 cursor-pointer">
            {item.product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-gray-500">{item.product.brand}</p>
        <p className="mt-1 text-sm font-medium text-gray-900">
          ₹{Number(item.product.price).toLocaleString()}
        </p>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center mx-4">
        <div className="flex items-center border border-gray-300 rounded-md">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={handleDecrease}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
            {item.quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={handleIncrease}
            disabled={item.quantity >= item.product.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Total Price */}
      <div className="ml-4 min-w-[80px] text-right">
        <p className="text-base font-medium text-gray-900">
          ₹{totalPrice.toLocaleString()}
        </p>
      </div>
      
      {/* Remove Button */}
      <div className="ml-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-red-600"
          onClick={onRemove}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

<?php

namespace src\GraphQL\Resolvers;

use src\Model\Order;
use src\Model\OrderItem;
use src\Model\Product\ProductFactory;

class MutationResolver
{
    public static function createOrder($root, $args)
    {
        try {
            $input = $args['input'];
            
            // Validate required fields - make customer info optional with defaults
            if (empty($input['items'])) {
                throw new \Exception('Missing required field: items are required');
            }
            
            // Create order with default customer info if not provided
            $order = new Order();
            $order->setCustomerEmail($input['customerEmail'] ?? 'customer@example.com');
            $order->setCustomerName($input['customerName'] ?? 'Customer');
            $order->setStatus('pending');
            
            if (!$order->save()) {
                throw new \Exception('Failed to create order');
            }
            
            $totalAmount = 0.0;
            
            // Process order items
            foreach ($input['items'] as $itemInput) {
                if (empty($itemInput['productId']) || empty($itemInput['quantity'])) {
                    throw new \Exception('Each item must have productId and quantity');
                }
                
                // Get product to validate it exists and get price
                $product = ProductFactory::createProductFromId($itemInput['productId']);
                if (!$product) {
                    throw new \Exception("Product with ID {$itemInput['productId']} not found");
                }
                
                if (!$product->isInStock()) {
                    throw new \Exception("Product {$product->getName()} is out of stock");
                }
                
                // Get product price
                $prices = $product->getPrices();
                if (empty($prices)) {
                    throw new \Exception("Product {$product->getName()} has no price information");
                }
                
                $unitPrice = $prices[0]->getAmount();
                $quantity = (int) $itemInput['quantity'];
                $subtotal = $unitPrice * $quantity;
                $totalAmount += $subtotal;
                
                // Create order item
                $orderItem = new OrderItem();
                $orderItem->setOrderId($order->getId());
                $orderItem->setProductId($itemInput['productId']);
                $orderItem->setQuantity($quantity);
                $orderItem->setUnitPrice($unitPrice);
                
                // Handle selected attributes if provided
                if (!empty($itemInput['selectedAttributes'])) {
                    $orderItem->setSelectedAttributes($itemInput['selectedAttributes']);
                }
                
                if (!$orderItem->save()) {
                    throw new \Exception('Failed to create order item');
                }
            }
            
            // Update order with total amount
            $order->setTotalAmount($totalAmount);
            $order->save();
            
            return [
                'success' => true,
                'order' => $order,
                'message' => 'Order created successfully'
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'order' => null,
                'message' => $e->getMessage()
            ];
        }
    }
} 
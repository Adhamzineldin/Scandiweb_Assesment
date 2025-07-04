<?php

namespace src\GraphQL\Types;

use src\GraphQL\Types\AttributeType;
use src\GraphQL\Types\AttributeSetType;
use src\GraphQL\Types\CategoryType;
use src\GraphQL\Types\CreateOrderResponseType;
use src\GraphQL\Types\CurrencyType;
use src\GraphQL\Types\OrderItemType;
use src\GraphQL\Types\OrderType;
use src\GraphQL\Types\PriceType;
use src\GraphQL\Types\ProductType;

class TypeRegistry
{
    private static $currency = null;
    private static $price = null;
    private static $attribute = null;
    private static $attributeSet = null;
    private static $category = null;
    private static $product = null;
    private static $orderItem = null;
    private static $order = null;
    private static $createOrderResponse = null;

    public static function currency()
    {
        return self::$currency ?: (self::$currency = new CurrencyType());
    }

    public static function price()
    {
        return self::$price ?: (self::$price = new PriceType());
    }

    public static function attribute()
    {
        return self::$attribute ?: (self::$attribute = new AttributeType());
    }

    public static function attributeSet()
    {
        return self::$attributeSet ?: (self::$attributeSet = new AttributeSetType());
    }

    public static function category()
    {
        return self::$category ?: (self::$category = new CategoryType());
    }

    public static function product()
    {
        return self::$product ?: (self::$product = new ProductType());
    }

    public static function orderItem()
    {
        return self::$orderItem ?: (self::$orderItem = new OrderItemType());
    }

    public static function order()
    {
        return self::$order ?: (self::$order = new OrderType());
    }

    public static function createOrderResponse()
    {
        return self::$createOrderResponse ?: (self::$createOrderResponse = new CreateOrderResponseType());
    }
} 
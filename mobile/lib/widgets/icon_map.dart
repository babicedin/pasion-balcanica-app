import 'package:flutter/material.dart';

/// Maps the lucide-style icon slugs that the backoffice IconPicker writes
/// (e.g. `alert-triangle`, `ambulance`) to a Material [IconData] that
/// Flutter can render without shipping a second icon font.
///
/// Slugs that don't have a direct Material equivalent are mapped to a
/// near-visual match. Unknown slugs fall back to a generic help icon so
/// the UI still renders something sensible.
IconData iconForSlug(String? slug) {
  switch (slug) {
    // Food & drink
    case 'utensils':
      return Icons.restaurant_rounded;
    case 'utensils-crossed':
      return Icons.restaurant_menu_rounded;
    case 'chef-hat':
      return Icons.soup_kitchen_rounded;
    case 'coffee':
      return Icons.local_cafe_rounded;
    case 'pizza':
      return Icons.local_pizza_rounded;
    case 'sandwich':
      return Icons.lunch_dining_rounded;
    case 'soup':
      return Icons.ramen_dining_rounded;
    case 'salad':
      return Icons.rice_bowl_rounded;
    case 'croissant':
      return Icons.bakery_dining_rounded;
    case 'cookie':
      return Icons.cookie_rounded;
    case 'cake':
      return Icons.cake_rounded;
    case 'ice-cream':
      return Icons.icecream_rounded;
    case 'candy':
      return Icons.cake_outlined;
    case 'popcorn':
      return Icons.fastfood_rounded;
    case 'apple':
      return Icons.emoji_food_beverage_rounded;
    case 'cherry':
    case 'grape':
    case 'citrus':
    case 'carrot':
      return Icons.eco_rounded;
    case 'beef':
    case 'drumstick':
      return Icons.dinner_dining_rounded;
    case 'fish':
      return Icons.set_meal_rounded;
    case 'egg':
      return Icons.egg_rounded;
    case 'milk':
      return Icons.local_drink_rounded;
    case 'beer':
      return Icons.sports_bar_rounded;
    case 'wine':
    case 'wine-glass':
      return Icons.wine_bar_rounded;
    case 'martini':
      return Icons.local_bar_rounded;
    case 'glass-water':
    case 'cup-soda':
      return Icons.local_drink_rounded;
    case 'store':
      return Icons.storefront_rounded;
    case 'shopping-bag':
      return Icons.shopping_bag_rounded;
    case 'shopping-cart':
      return Icons.shopping_cart_rounded;

    // Service / important numbers
    case 'phone':
    case 'phone-call':
      return Icons.call_rounded;
    case 'alert-triangle':
    case 'alert-circle':
      return Icons.warning_amber_rounded;
    case 'ambulance':
      return Icons.local_hospital_rounded;
    case 'hospital':
      return Icons.local_hospital_rounded;
    case 'stethoscope':
      return Icons.medical_services_rounded;
    case 'pill':
      return Icons.medication_rounded;
    case 'cross':
      return Icons.health_and_safety_rounded;
    case 'shield':
    case 'shield-alert':
      return Icons.shield_rounded;
    case 'siren':
      return Icons.emergency_rounded;
    case 'flame':
      return Icons.local_fire_department_rounded;
    case 'life-buoy':
      return Icons.safety_divider_rounded;
    case 'bus':
      return Icons.directions_bus_rounded;
    case 'train':
      return Icons.train_rounded;
    case 'plane':
      return Icons.flight_rounded;
    case 'ship':
      return Icons.directions_boat_rounded;
    case 'anchor':
      return Icons.anchor_rounded;
    case 'car':
      return Icons.directions_car_rounded;
    case 'bike':
      return Icons.directions_bike_rounded;
    case 'compass':
      return Icons.explore_rounded;
    case 'globe':
      return Icons.public_rounded;
    case 'map':
      return Icons.map_rounded;
    case 'map-pin':
      return Icons.place_rounded;
    case 'landmark':
      return Icons.account_balance_rounded;
    case 'building':
    case 'building-2':
      return Icons.apartment_rounded;
    case 'info':
      return Icons.info_rounded;
    case 'help-circle':
      return Icons.help_outline_rounded;
    case 'zap':
      return Icons.bolt_rounded;
    case 'tag':
      return Icons.label_rounded;

    // Shopping
    case 'shirt':
      return Icons.checkroom_rounded;
    case 'watch':
      return Icons.watch_rounded;
    case 'gem':
      return Icons.diamond_rounded;
    case 'gift':
      return Icons.card_giftcard_rounded;
    case 'scissors':
      return Icons.content_cut_rounded;
    case 'hammer':
      return Icons.handyman_rounded;
    case 'palette':
      return Icons.palette_rounded;
    case 'paintbrush':
      return Icons.brush_rounded;
    case 'flower':
      return Icons.local_florist_rounded;
    case 'sparkles':
      return Icons.auto_awesome_rounded;
    case 'book':
      return Icons.menu_book_rounded;
    case 'music':
      return Icons.music_note_rounded;
    case 'headphones':
      return Icons.headphones_rounded;
    case 'hand-heart':
      return Icons.favorite_rounded;

    default:
      return Icons.help_outline_rounded;
  }
}

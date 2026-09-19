const express = require("express");
const { getProductByBarcode } = require("../services/openFoodFactsService");

const router = express.Router();

router.get("/:barcode", async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode || !/^\d{8,14}$/.test(barcode)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid barcode.",
      });
    }

    const data = await getProductByBarcode(barcode);

    if (!data.product) {
      return res.status(404).json({
        success: false,
        message: "Product information not available.",
        barcode,
      });
    }

    const product = data.product;

    res.json({
      success: true,
      product: {
        barcode: product.code || barcode,
        name: product.product_name || "Unknown product",
        brand: product.brands || "Unknown brand",
        image: product.image_front_url || null,

        nutrition: {
          calories: product.nutriments?.["energy-kcal_100g"] ?? null,
          protein: product.nutriments?.proteins_100g ?? null,
          carbohydrates: product.nutriments?.carbohydrates_100g ?? null,
          sugars: product.nutriments?.sugars_100g ?? null,
          fat: product.nutriments?.fat_100g ?? null,
          saturatedFat:
            product.nutriments?.["saturated-fat_100g"] ?? null,
          fiber: product.nutriments?.fiber_100g ?? null,
          sodium: product.nutriments?.sodium_100g ?? null,
        },

        ingredients: product.ingredients_text || "",
        categories: product.categories || "",
        nutriScore: product.nutriscore_grade || null,

        source: "Open Food Facts",
      },
    });
  } catch (error) {
    console.error("Product lookup error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch product information.",
    });
  }
});

module.exports = router;
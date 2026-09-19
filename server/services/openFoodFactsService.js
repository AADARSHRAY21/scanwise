const OPEN_FOOD_FACTS_URL =
  "https://world.openfoodfacts.org/api/v3/product";

const USER_AGENT =
  "ScanWise/0.1 (hackathon-project)";

async function getProductByBarcode(barcode) {
  const response = await fetch(
    `${OPEN_FOOD_FACTS_URL}/${encodeURIComponent(barcode)}?lc=en`,
    {
      headers: {
        "User-Agent": USER_AGENT,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Open Food Facts request failed with status ${response.status}`
    );
  }

  const data = await response.json();

  return data;
}

module.exports = {
  getProductByBarcode,
};
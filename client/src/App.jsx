import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000'

function App() {
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const cleanBarcode = barcode.trim()

    if (!/^\d{8,14}$/.test(cleanBarcode)) {
      setProduct(null)
      setError('Enter a valid 8–14 digit barcode.')
      return
    }

    setLoading(true)
    setError('')
    setProduct(null)

    try {
      const response = await fetch(
        `${API_URL}/api/products/${encodeURIComponent(cleanBarcode)}`
      )
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Product information is unavailable.')
      }

      setProduct(data.product)
    } catch (requestError) {
      setError(
        requestError.message ||
          'Could not reach the ScanWise backend. Make sure it is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <p className="eyebrow">SCANWISE</p>
        <h1>Scan it. Understand it. Decide smarter.</h1>
        <p className="hero-copy">
          Look up packaged food products and see their nutrition and ingredient
          information in one clear place.
        </p>

        <form className="search-form" onSubmit={handleSubmit}>
          <label htmlFor="barcode">Product barcode</label>
          <div className="search-row">
            <input
              id="barcode"
              type="text"
              inputMode="numeric"
              placeholder="Example: 3017624010701"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              aria-describedby="barcode-help"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Analyzing…' : 'Analyze product'}
            </button>
          </div>
          <small id="barcode-help">
            Enter the 8–14 digit barcode printed on the product.
          </small>
        </form>

        {error && <p className="message error-message">{error}</p>}
      </section>

      {product && (
        <section className="product-card" aria-live="polite">
          <div className="product-summary">
            {product.image ? (
              <img
                className="product-image"
                src={product.image}
                alt={product.name}
              />
            ) : (
              <div className="image-placeholder">No image available</div>
            )}

            <div>
              <p className="eyebrow">PRODUCT FOUND</p>
              <h2>{product.name}</h2>
              <p className="brand">{product.brand}</p>

              {product.nutriScore && (
                <p className={`nutri-score score-${product.nutriScore}`}>
                  Nutri-Score: {product.nutriScore.toUpperCase()}
                </p>
              )}

              <p className="barcode-label">Barcode: {product.barcode}</p>
            </div>
          </div>

          <div className="details-grid">
            <section>
              <h3>Nutrition per 100 g</h3>
              <dl className="nutrition-grid">
                <div>
                  <dt>Calories</dt>
                  <dd>{product.nutrition.calories ?? '—'} kcal</dd>
                </div>
                <div>
                  <dt>Protein</dt>
                  <dd>{product.nutrition.protein ?? '—'} g</dd>
                </div>
                <div>
                  <dt>Carbohydrates</dt>
                  <dd>{product.nutrition.carbohydrates ?? '—'} g</dd>
                </div>
                <div>
                  <dt>Sugars</dt>
                  <dd>{product.nutrition.sugars ?? '—'} g</dd>
                </div>
                <div>
                  <dt>Fat</dt>
                  <dd>{product.nutrition.fat ?? '—'} g</dd>
                </div>
                <div>
                  <dt>Saturated fat</dt>
                  <dd>{product.nutrition.saturatedFat ?? '—'} g</dd>
                </div>
                <div>
                  <dt>Fibre</dt>
                  <dd>{product.nutrition.fiber ?? '—'} g</dd>
                </div>
                <div>
                  <dt>Sodium</dt>
                  <dd>{product.nutrition.sodium ?? '—'} g</dd>
                </div>
              </dl>
            </section>

            <section>
              <h3>Ingredients</h3>
              <p className="ingredients">
                {product.ingredients || 'Ingredient information is unavailable.'}
              </p>

              <h3>Categories</h3>
              <p className="categories">
                {product.categories || 'Category information is unavailable.'}
              </p>
            </section>
          </div>

          <p className="source">Data provided by {product.source}.</p>
        </section>
      )}
    </main>
  )
}

export default App;
import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import './App.css'

const API_URL = 'http://localhost:5000'

function App() {
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const [comparisonProducts, setComparisonProducts] = useState([])
  const videoRef = useRef(null)
  const scannerControlsRef = useRef(null)

  useEffect(() => {
    return () => scannerControlsRef.current?.stop()
  }, [])

  async function lookupProduct(rawBarcode) {
    const cleanBarcode = rawBarcode.trim()
    if (!/^\d{8,14}$/.test(cleanBarcode)) {
      setProduct(null)
      setError('Enter a valid 8–14 digit barcode.')
      return false
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
      return true
    } catch (requestError) {
      setError(
        requestError.message ||
          'Could not reach the ScanWise backend. Make sure it is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await lookupProduct(barcode)
  }

  function addToComparison() {
    if (!product) return

    if (comparisonProducts.some((item) => item.barcode === product.barcode)) {
      setError('This product is already in your comparison.')
      return
    }

    if (comparisonProducts.length === 2) {
      setError('Remove a product before adding another one.')
      return
    }

    setError('')
    setComparisonProducts((items) => [...items, product])
  }

  function removeFromComparison(barcodeToRemove) {
    setComparisonProducts((items) =>
      items.filter((item) => item.barcode !== barcodeToRemove)
    )
  }

  function comparisonSummary() {
    if (comparisonProducts.length < 2) {
      return 'Add one more product to see a side-by-side nutrition comparison.'
    }

    const [firstProduct, secondProduct] = comparisonProducts
    const firstScore = firstProduct.insight?.score
    const secondScore = secondProduct.insight?.score

    if (typeof firstScore !== 'number' || typeof secondScore !== 'number') {
      return 'Both products need a ScanWise Insight score before they can be compared.'
    }

    if (firstScore === secondScore) {
      return 'Both products have the same ScanWise Insight score.'
    }

    const higherProduct = firstScore > secondScore ? firstProduct : secondProduct
    const difference = Math.abs(firstScore - secondScore)

    return `${higherProduct.name} has a ${difference}-point higher ScanWise Insight score.`
  }

  function stopScanner() {
    scannerControlsRef.current?.stop()
    scannerControlsRef.current = null
    setScannerOpen(false)
  }

  async function startScanner() {
    setError('')
    setScannerError('')
    setScannerOpen(true)

    await new Promise((resolve) => requestAnimationFrame(resolve))

    try {
      const codeReader = new BrowserMultiFormatReader()
      const controls = await codeReader.decodeFromConstraints(
        {
          audio: false,
          video: { facingMode: { ideal: 'environment' } },
        },
        videoRef.current,
        async (result) => {
          if (!result) return

          const scannedBarcode = result.getText()
          stopScanner()
          setBarcode(scannedBarcode)
          await lookupProduct(scannedBarcode)
        }
      )

      scannerControlsRef.current = controls
    } catch (cameraError) {
      setScannerError(
        'Camera access was unavailable. Allow camera access, then try again.'
      )
      setScannerOpen(false)
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
          <button type="button" className="scan-button" onClick={startScanner}>
            Scan with camera
          </button>
        </form>

        {error && <p className="message error-message">{error}</p>}
        {scannerError && <p className="message error-message">{scannerError}</p>}
      </section>

      {scannerOpen && (
        <section className="scanner-panel" aria-label="Camera barcode scanner">
          <div>
            <p className="eyebrow">CAMERA SCANNER</p>
            <h2>Point your camera at the barcode</h2>
            <p>Hold the barcode inside the camera frame until ScanWise finds it.</p>
          </div>
          <video ref={videoRef} className="scanner-video" muted playsInline />
          <button type="button" className="close-scanner" onClick={stopScanner}>
            Stop camera
          </button>
        </section>
      )}

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
              <button
                type="button"
                className="compare-button"
                onClick={addToComparison}
                disabled={comparisonProducts.some(
                  (item) => item.barcode === product.barcode
                )}
              >
                {comparisonProducts.some((item) => item.barcode === product.barcode)
                  ? 'Added to comparison'
                  : 'Add to comparison'}
              </button>
            </div>
          </div>

          {product.insight && (
            <section className="insight-card" aria-label="ScanWise product insight">
              <div className="insight-score">
                <span>{product.insight.score}</span>
                <small>/ 100</small>
              </div>
              <div>
                <p className="eyebrow">SCANWISE INSIGHT</p>
                <h3>{product.insight.label}</h3>
                <p>{product.insight.summary}</p>
              </div>
              <ul className="insight-factors">
                {product.insight.scoreFactors.map((factor) => (
                  <li key={factor.text} className={`factor-${factor.tone}`}>
                    {factor.text}
                  </li>
                ))}
              </ul>
            </section>
          )}

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

          <p className="source">
            Data provided by {product.source}. ScanWise Insight is informational,
            not medical advice.
          </p>
        </section>
      )}

      {comparisonProducts.length > 0 && (
        <section className="comparison-card" aria-live="polite">
          <div className="comparison-heading">
            <div>
              <p className="eyebrow">PRODUCT COMPARISON</p>
              <h2>Choose with context</h2>
              <p>{comparisonSummary()}</p>
            </div>
            <span className="comparison-count">
              {comparisonProducts.length} / 2 products
            </span>
          </div>

          <div className="comparison-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nutrition per 100 g</th>
                  {comparisonProducts.map((item) => (
                    <th key={item.barcode}>
                      <span>{item.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFromComparison(item.barcode)}
                        aria-label={`Remove ${item.name} from comparison`}
                      >
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>ScanWise Insight</th>
                  {comparisonProducts.map((item) => (
                    <td key={item.barcode}>{item.insight?.score ?? '—'} / 100</td>
                  ))}
                </tr>
                <tr>
                  <th>Calories</th>
                  {comparisonProducts.map((item) => (
                    <td key={item.barcode}>{item.nutrition.calories ?? '—'} kcal</td>
                  ))}
                </tr>
                <tr>
                  <th>Sugars</th>
                  {comparisonProducts.map((item) => (
                    <td key={item.barcode}>{item.nutrition.sugars ?? '—'} g</td>
                  ))}
                </tr>
                <tr>
                  <th>Saturated fat</th>
                  {comparisonProducts.map((item) => (
                    <td key={item.barcode}>{item.nutrition.saturatedFat ?? '—'} g</td>
                  ))}
                </tr>
                <tr>
                  <th>Fibre</th>
                  {comparisonProducts.map((item) => (
                    <td key={item.barcode}>{item.nutrition.fiber ?? '—'} g</td>
                  ))}
                </tr>
                <tr>
                  <th>Protein</th>
                  {comparisonProducts.map((item) => (
                    <td key={item.barcode}>{item.nutrition.protein ?? '—'} g</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}

export default App;

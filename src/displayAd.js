import { find } from 'lodash/collection'
import googleDisplayAd from 'src/google/googleDisplayAd'
import { getConfig } from 'src/config'

const mockDisplayAd = (adId, config) => {
  let mockNetworkDelayMs = 0
  const useMockDelay = false
  if (useMockDelay) {
    mockNetworkDelayMs = Math.random() * (1500 - 900) + 900
  }
  const adUnit = find(config.adUnits, { adId })

  // Use the height of the first specified size of this ad unit.
  const height = adUnit && adUnit.sizes ? adUnit.sizes[0][1] : 0

  // Mock returning an ad.
  setTimeout(() => {
    const elem = window.document.getElementById(adId)
    if (!elem) {
      return
    }
    elem.setAttribute(
      'style',
      `
      color: white;
      background: repeating-linear-gradient(
        -55deg,
        #222,
        #222 20px,
        #333 20px,
        #333 40px
      );
      width: 100%;
      height: ${height}px;
    `
    )
  }, mockNetworkDelayMs)
}

export default adId => {
  const config = getConfig()
  if (!config.disableAds) {
    googleDisplayAd(adId)
  } else if (config.useMockAds) {
    mockDisplayAd(adId, config)
  }
}

import React from 'react'
import PropTypes from 'prop-types'
import ErrorBoundary from 'src/ErrorBoundary'
import displayAd from 'src/displayAd'
import { onAdRendered } from 'src/adDisplayListeners'

// Suggestions on a React component using Google ads:
// https://stackoverflow.com/q/25435066/1332513
// This component needs to support server-side rendering,
// which means we need to take care to not import bidder code
// that relies on the window.
class Ad extends React.Component {
  componentDidMount() {
    const { adId, onError } = this.props

    try {
      // Display the ad as soon as it's available.
      displayAd(adId)

      // On ad display, call the onAdDisplayed callback.
      onAdRendered(adId, this.onAdDisplayedHandler.bind(this))
    } catch (e) {
      onError(e)
    }
  }

  // Never update. This prevents unexpected unmounting or
  // rerendering of third-party ad content.
  shouldComponentUpdate() {
    return false
  }

  onAdDisplayedHandler(bidResponse) {
    const { onAdDisplayed } = this.props
    onAdDisplayed(bidResponse)
  }

  render() {
    const { adId, onError, style } = this.props
    return (
      <ErrorBoundary onError={onError}>
        <div style={style}>
          <div id={adId} data-testid="ad-container" />
        </div>
      </ErrorBoundary>
    )
  }
}

Ad.propTypes = {
  adId: PropTypes.string.isRequired,
  onAdDisplayed: PropTypes.func,
  onError: PropTypes.func,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
}

Ad.defaultProps = {
  onAdDisplayed: () => {},
  onError: () => {},
  style: {},
}

export default Ad

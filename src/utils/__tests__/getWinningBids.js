/* eslint-env jest */

import { clearAdDataStore, getAdDataStore } from 'src/utils/storage'
import {
  mockGoogleTagSlotRenderEndedData,
  getMockTabAdsUserConfig,
} from 'src/utils/test-utils'
import { getConfig, setConfig } from 'src/config'
import BidResponse from 'src/utils/BidResponse'

const getMockBidderStoredData = () => {
  const { newTabAds } = getConfig()
  return {
    bidResponses: {
      [newTabAds.leaderboard.adId]: [],
      [newTabAds.rectangleAdPrimary.adId]: [],
      [newTabAds.rectangleAdSecondary.adId]: [],
    },
    rawBidResponses: [{}, {}, {}], // not relevant to testing this module
    includedInAdRequest: true,
  }
}

// Set up a store with example bid responses from our bidders.
const setUpStoreWithBidders = () => {
  const store = getAdDataStore()
  store.bidResponses = {
    amazon: getMockBidderStoredData(),
    indexExchange: getMockBidderStoredData(),
    prebid: getMockBidderStoredData(),
  }
}

beforeEach(() => {
  setConfig(getMockTabAdsUserConfig())
})

afterEach(() => {
  jest.clearAllMocks()
  clearAdDataStore()
})

describe('getWinningBids: getWinningBidForAd', () => {
  it('returns the expected DisplayedAdInfo', () => {
    const mockGAMAdvertiserId = 112233
    const { newTabAds } = getConfig()
    const { adId } = newTabAds.leaderboard

    // Set up the store.
    const store = getAdDataStore()

    // Set up stored bids for the leaderboard ad.
    setUpStoreWithBidders()
    store.bidResponses.amazon.bidResponses[adId].push(
      BidResponse({
        adId,
        encodedRevenue: 'some-encoded-revenue-0101',
        advertiserName: 'amazon',
        adSize: '728x90',
      })
    )
    store.bidResponses.indexExchange.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.0031,
        advertiserName: 'indexExchange',
        adSize: '728x90',
      })
    )
    store.bidResponses.prebid.bidResponses[adId].push(
      BidResponse({
        adId,
        revenue: 0.0002,
        advertiserName: 'openx',
        adSize: '728x90',
      }),
      BidResponse({
        adId,
        revenue: 0.02024,
        advertiserName: 'appnexus',
        adSize: '728x90',
      })
    )

    // Set that the leaderboard ad was displayed.
    store.adManager.slotsRendered[adId] = mockGoogleTagSlotRenderEndedData(
      adId,
      '/123456/some-ad/',
      {
        advertiserId: mockGAMAdvertiserId,
      }
    )

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toEqual({
      adId,
      GAMAdvertiserId: mockGAMAdvertiserId,
      revenue: 0.02024,
      encodedRevenue: 'some-encoded-revenue-0101',
      adSize: '728x90',
    })
  })

  it("returns null if there isn't any stored data for the rendered ad", () => {
    const adId = 'my-ad-id-123'

    // Set up the store.
    const store = getAdDataStore()
    store.adManager.slotsRendered[adId] = undefined

    const { getWinningBidForAd } = require('src/utils/getWinningBids')
    const adInfo = getWinningBidForAd(adId)
    expect(adInfo).toBeNull()
  })
})
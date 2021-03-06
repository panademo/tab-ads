/* eslint-env jest */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react'
import { render } from '@testing-library/react'
import displayAd from 'src/displayAd'
import { onAdRendered } from 'src/adDisplayListeners'
import { getMockBidResponse } from 'src/utils/test-utils'

jest.mock('src/displayAd')
jest.mock('src/adDisplayListeners')

const getMockProps = () => ({
  adId: 'my-wonderful-ad-id',
  onAdDisplayed: jest.fn(),
  style: undefined,
  onError: jest.fn(),
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('Ad component', () => {
  it('renders a child with a div ID equal to the adId prop', () => {
    expect.assertions(1)
    const AdComponent = require('src/AdComponent').default
    const mockProps = getMockProps()
    const { getByTestId } = render(<AdComponent {...mockProps} />)
    expect(getByTestId('ad-container')).toHaveAttribute('id', mockProps.adId)
  })

  it('sets the style on the root element', () => {
    expect.assertions(1)
    const AdComponent = require('src/AdComponent').default
    const mockProps = {
      ...getMockProps(),
      style: {
        display: 'inline',
        backgroundColor: 'green',
      },
    }
    const { container } = render(<AdComponent {...mockProps} />)
    expect(container.firstChild).toHaveStyle(mockProps.style)
  })

  it('does not rerender after the initial mount', () => {
    expect.assertions(4)
    const AdComponent = require('src/AdComponent').default
    const mockProps = {
      ...getMockProps(),
      adId: 'this-is-the-id',
      style: {
        display: 'inline',
        backgroundColor: 'green',
      },
    }
    const { container, getByTestId, rerender } = render(
      <AdComponent {...mockProps} />
    )
    expect(getByTestId('ad-container')).toHaveAttribute('id', mockProps.adId)
    expect(container.firstChild).toHaveStyle(mockProps.style)

    const newMockProps = {
      ...getMockProps(),
      adId: 'another-id',
      style: {
        display: 'block',
        backgroundColor: 'purple',
      },
    }
    rerender(<AdComponent {...newMockProps} />)

    // Component should not have changed.
    expect(getByTestId('ad-container')).toHaveAttribute('id', mockProps.adId)
    expect(container.firstChild).toHaveStyle(mockProps.style)
  })

  it('calls displayAd on mount', () => {
    expect.assertions(2)
    const AdComponent = require('src/AdComponent').default
    const mockProps = getMockProps()
    render(<AdComponent {...mockProps} />)
    expect(displayAd).toHaveBeenCalledWith(mockProps.adId)
    expect(displayAd).toHaveBeenCalledTimes(1)
  })

  it('calls onAdRendered with the ad ID and a callback handler', () => {
    expect.assertions(1)
    const AdComponent = require('src/AdComponent').default
    const mockProps = getMockProps()
    render(<AdComponent {...mockProps} />)
    expect(onAdRendered).toHaveBeenCalledWith(
      mockProps.adId,
      expect.any(Function)
    )
  })

  it('when onAdRendered fires, it calls the onAdDisplayed prop with the bid response', () => {
    expect.assertions(2)
    const AdComponent = require('src/AdComponent').default
    const mockProps = getMockProps()
    const mockBidResponse = {
      ...getMockBidResponse(),
      adId: mockProps.adId,
    }
    render(<AdComponent {...mockProps} />)
    const onAdRenderedHandler = onAdRendered.mock.calls[0][1]

    expect(mockProps.onAdDisplayed).not.toHaveBeenCalled()
    onAdRenderedHandler(mockBidResponse)
    expect(mockProps.onAdDisplayed).toHaveBeenCalledWith(mockBidResponse)
  })

  it('calls onError if displayAd throws', () => {
    expect.assertions(1)
    const AdComponent = require('src/AdComponent').default

    // Mock an error in displayAd.
    const mockErr = new Error('Problems, problems, problems.')
    displayAd.mockImplementationOnce(() => {
      throw mockErr
    })

    const mockProps = getMockProps()
    render(<AdComponent {...mockProps} />)
    expect(mockProps.onError).toHaveBeenCalledWith(mockErr)
  })
})

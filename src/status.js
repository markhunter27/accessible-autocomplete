import { createElement, Component } from 'preact' /** @jsx createElement */

const debounce = function (func, wait, immediate) {
  var timeout
  return function () {
    var context = this
    var args = arguments
    var later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}
const statusDebounceMillis = 1400

export default class Status extends Component {
  static defaultProps = {
    tQueryTooShort: (minQueryLength) => `Type in ${minQueryLength} or more characters for results`,
    tNoResults: () => 'No search results',
    tSelectedOption: (selectedOption, length, index) => `${selectedOption} ${index + 1} of ${length} is highlighted`,
    tResults: (length, contentSelectedOption) => {
      const words = {
        result: (length === 1) ? 'result' : 'results',
        is: (length === 1) ? 'is' : 'are'
      }

      return `${length} ${words.result} ${words.is} available. ${contentSelectedOption}`
    }
  };

  state = {
    bump: false,
    debounced: false
  }

  componentWillMount () {
    const that = this
    let flip = false
    this.debounceStatusUpdate = debounce(function (content) {
      const shouldSilence = !that.props.isInFocus || that.props.validChoiceMade
      if (!shouldSilence) {
        const liveElementSelector = (flip) ? '#ariaLiveA' : '#ariaLiveB'
        document.querySelector(liveElementSelector).textContent = content.trim()
        flip = !flip
      }
    }, statusDebounceMillis)
  }

  componentDidUpdate () {
    const {
      length,
      queryLength,
      minQueryLength,
      selectedOption,
      selectedOptionIndex,
      tQueryTooShort,
      tNoResults,
      tSelectedOption,
      tResults
    } = this.props

    const queryTooShort = queryLength < minQueryLength
    const noResults = length === 0
    const contentSelectedOption = selectedOption
      ? tSelectedOption(selectedOption, length, selectedOptionIndex)
      : ''

    let content = null
    if (queryTooShort) {
      content = tQueryTooShort(minQueryLength)
    } else if (noResults) {
      content = tNoResults()
    } else {
      content = tResults(length, contentSelectedOption)
    }

    this.debounceStatusUpdate(content)
  }

  render () {
    return (
      <div
        style={{
          border: '0',
          clip: 'rect(0 0 0 0)',
          height: '1px',
          marginBottom: '-1px',
          marginRight: '-1px',
          overflow: 'hidden',
          padding: '0',
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px'
        }}>
        <div
          id='ariaLiveA'
          aria-atomic='true'
          aria-live='polite' />
        <div
          id='ariaLiveB'
          aria-atomic='true'
          aria-live='polite' />
      </div>
    )
  }
}

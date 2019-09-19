<template>
  <div class="autocomplete">
    <div class="form-item">
      <div class="form-group form-item">
        <label class="form-label">{{ label }}</label>
        <input type="text" class="form-control form-input" :class="inputClass" v-model="input" />
      </div>
      <div class="list suggestions" v-if="suggestions.length && !(suggestions.length === 1 && suggestions[0].text === input)">
        <div class="list-item pointer" v-for="suggestion in suggestions" v-on:click="selectItem(suggestion.text)">
          <div class="item-name" v-if="suggestion.chunks">
            <span class="regular" v-for="chunk in suggestion.chunks" :data-match="suggestion.match">{{ chunk }}</span>
          </div>
          <div class="item-name" v-if="!suggestion.chunks">
            <span class="regular">{{ suggestion.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'autoComplete',
  props: ['inputClass', 'label', 'onType', 'onSelect'],
  data () {
    return {
      enabled: true,
      input: '',
      suggestions: []
    }
  },
  filters: {
    beautify (input) {
      const parsed = input.chunks.map(item => `<span class="regular">${item}</span>`).join(`<span class="highlighted">${input.match}</span>`)
      return parsed
    }
  },
  methods: {
    selectItem (item) {
      this.enabled = false
      this.input = item
      this.suggestions = []
      this.onSelect(item)
      this.enabled = true
    }
  },
  watch: {
    input (val) {
      if (!this.enabled) {
        return
      }

      const input = val !== '' ? new RegExp(val, 'ig') : null
      this.onType(input, val)
        .then(data => {
          if (!input) {
            this.suggestions = []
            return
          }
          this.suggestions = data.map(text => {
            try {
              const match = text.match(input)[0]
              const chunks = text.split(match)

              return {
                chunks, match, text
              }
            } catch (e) {
              console.error(e)
              return {
                text
              }
            }
          })
        })
        .catch(err => {
          console.error('ERROR: Autocomplete custom onType function failed executing')
          console.error(err)
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '../../assets/colors';

.autocomplete {
  position: relative;

  .suggestions {
    position: absolute !important;
    width: 100%;
    z-index: 2;

    .item-name {
      .regular {

        &:not(:last-child) {
          &::after {
            content: attr(data-match);
            color: $highlighted-color;
          }
        }
      }

      .highlighted {
        color: $highlighted-color;
      }
    }
  }
}

</style>

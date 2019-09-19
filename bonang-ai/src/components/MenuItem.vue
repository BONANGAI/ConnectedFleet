<template>
  <div class="menu-item" :class="[{ 'selected': active }, `menu-${section.type || 'click'}`]" v-on:click="itemClick(section, $event, true)">
    <span class="menu-item-title">
      {{ section.name }}
    </span>
    <span class="menu-item-badges" v-if="section.data && section.data.alerts && section.data.alerts.length">
      <span class="badge badge-plain badge-danger">{{ section.data.alerts.length }}</span>
    </span>
    <span class="menu-item-message" v-if="section.data && section.data.menuMessage">
      <span class="text-danger">{{ section.data.menuMessage }}</span>
    </span>
    <span class="menu-item-overview" v-if="section.overview">
      {{ section.overview }}
    </span>
    <div class="menu-subitems" v-if="section.type === 'collapsible' && section.items" :class="{ opened: section.$active }">
      <div class="menu-subitem" v-for="subsection in section.items" v-bind:key="subsection.code">
        <span class="subitem-content bt-label-item tuple" v-if="subsection.type === 'tuple'" :data-label="subsection.label">{{ `${subsection.value} ${subsection.unit}` }}</span>
        <div class="subitem-content binomial-timeline" v-else-if="subsection.type === 'binomial-timeline'">
          <span class="bt-label-item from" data-label="Start time">{{ subsection.from }}</span>
          <span class="bt-label-item to" data-label="End time">{{ subsection.to }}</span>
        </div>
      </div>
    </div>
    <div class="menu menu-subitems" v-else-if="section.type === 'group'">
      <menu-item :section="subsection" v-for="subsection in section.items" v-bind:key="subsection.code" :active="subsection.$active" :click="click"></menu-item>
    </div>
  </div>
</template>

<script>
import MenuItem from './MenuItem'

export default {
  name: 'menuItem',
  props: ['all', 'section', 'active', 'click'],
  components: {
    MenuItem
  },
  created () {
    
  },
  data () {
    return {
    }
  },
  methods: {
    activate (element) {
      this.deactivateAll(this.all)
      element.$active = true
    },

    deactivateAll (items) {
      if (!items || !items.length ) {
        return
      }

      for (let i = 0; items && i < items.length; i++) {
        const root = items[i]
        root.$active = false;
        this.deactivateAll(root.items)
      }
    },

    itemClick (item, event, prevent) {
      this.click(item)
      if (item.type === 'collapsible') {
        item.$active = !item.$active
      }

      if (prevent) {
        event.preventDefault()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '../assets/colors.scss';

.menu-item {
  .badge-danger {
    background: $badge-red-background;
  }

  .text-danger {
    color: $badge-red-background;
  }
}

</style>

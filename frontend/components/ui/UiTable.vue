<template>
  <div class="ui-table-wrap">
    <table class="ui-table" :class="{ 'ui-table--expandable': expandable }">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" scope="col" :style="colStyle(column)">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="ui-table__empty">
            {{ loadingText }}
          </td>
        </tr>
        <tr v-else-if="!rows.length">
          <td :colspan="columns.length" class="ui-table__empty">
            {{ emptyText }}
          </td>
        </tr>
        <template v-else>
          <template v-for="(row, index) in rows" :key="rowKey(row, index)">
            <tr
              class="ui-table__row"
              :class="[
                {
                  'ui-table__row--clickable': expandable,
                  'is-expanded': isExpanded(row, index),
                },
                resolveRowClass(row, index),
              ]"
              @click="expandable && toggleExpand(row, index, $event)"
            >
              <td v-for="column in columns" :key="`${rowKey(row, index)}-${column.key}`">
                <slot :name="`cell-${column.key}`" :row="row" :column="column" :index="index">
                  {{ formatCell(row, column) }}
                </slot>
              </td>
            </tr>
            <tr v-if="expandable && isExpanded(row, index)" class="ui-table__expand-row">
              <td :colspan="columns.length" class="ui-table__expand-cell">
                <slot name="expand" :row="row" :index="index" />
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Loading…' },
  emptyText: { type: String, default: 'No data found.' },
  rowKeyName: { type: String, default: '_id' },
  expandable: { type: Boolean, default: false },
  rowClass: { type: [String, Function], default: '' },
})

const expanded = ref(new Set())

function rowKey(row, index) {
  return row?.[props.rowKeyName] ?? index
}

function resolveRowClass(row, index) {
  if (typeof props.rowClass === 'function') {
    return props.rowClass(row, index) || ''
  }
  return props.rowClass || ''
}

function isExpanded(row, index) {
  return expanded.value.has(String(rowKey(row, index)))
}

function toggleExpand(row, index, event) {
  const target = event?.target
  if (target?.closest('select, button, a, input, textarea, label, .ui-input')) {
    return
  }

  const key = String(rowKey(row, index))
  const next = new Set(expanded.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expanded.value = next
}

function colStyle(column) {
  if (!column?.width) return undefined
  return { width: column.width }
}

function formatCell(row, column) {
  const value = row?.[column.key]
  if (value == null || value === '') return '—'
  if (typeof column.format === 'function') return column.format(value, row)
  return value
}
</script>

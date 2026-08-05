<template>
  <div class="admin-messages">
    <div class="admin-toolbar">
      <p class="admin-toolbar__meta">
        {{
          initialLoading
            ? 'Loading…'
            : `${messages.length} message${messages.length === 1 ? '' : 's'}`
        }}
      </p>
    </div>

    <div v-if="loadError" class="admin-panel admin-panel--error" role="alert">
      {{ loadError }}
    </div>

    <UiTable
      v-else
      :columns="columns"
      :rows="messages"
      :loading="initialLoading"
      loading-text="Loading messages…"
      empty-text="No messages yet."
    >
      <template #cell-name="{ row }">
        <div class="admin-messages__name">
          <span class="ui-table__name" :title="row.name">{{ row.name }}</span>
          <span v-if="row.replied" class="admin-messages__badge">Replied</span>
        </div>
      </template>

      <template #cell-email="{ row }">
        <a class="admin-messages__email" :href="`mailto:${row.email}`" :title="row.email">
          {{ row.email }}
        </a>
      </template>

      <template #cell-message="{ row }">
        <div class="admin-messages__body">
          <p :class="{ 'is-clamped': !isExpanded(row._id) }">
            {{ row.message }}
          </p>
          <button
            v-if="needsToggle(row.message)"
            type="button"
            class="admin-messages__more"
            @click="toggleExpanded(row._id)"
          >
            {{ isExpanded(row._id) ? 'Show less' : 'Read more' }}
          </button>
        </div>
      </template>

      <template #cell-actions="{ row }">
        <button type="button" class="btn btn--ghost btn--sm" @click="openReply(row)">
          {{ row.replied ? 'Reply Again' : 'Reply' }}
        </button>
      </template>
    </UiTable>

    <UiModal
      v-model="replyOpen"
      :title="replyTarget ? `Reply to ${replyTarget.name}` : 'Reply'"
      :persist="sending"
    >
      <UiField label="Your reply" required :disabled="sending" :error="replyError">
        <UiTextarea
          v-model="replyText"
          :rows="6"
          required
          :disabled="sending"
          placeholder="Write your reply…"
        />
      </UiField>

      <template #footer>
        <button type="button" class="btn btn--ghost" :disabled="sending" @click="closeReply">
          Cancel
        </button>
        <button type="button" class="btn btn--primary" :disabled="sending" @click="sendReply">
          {{ sending ? 'Sending…' : 'Send' }}
        </button>
      </template>
    </UiModal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  title: 'Messages',
  pageTransition: false,
})

useHead({ title: 'Messages — Admin' })

const TRUNCATE_AT = 120

const { api } = useAdminApi()
const { $toast } = useNuxtApp()

const messages = ref([])
const initialLoading = ref(true)
const loadError = ref('')
const expandedIds = ref(new Set())

const replyOpen = ref(false)
const replyTarget = ref(null)
const replyText = ref('')
const replyError = ref('')
const sending = ref(false)

const columns = [
  { key: 'name', label: 'Name', width: '180px' },
  { key: 'email', label: 'Email', width: '200px' },
  { key: 'message', label: 'Message' },
  {
    key: 'createdAt',
    label: 'Date received',
    width: '130px',
    format: (value) => formatDate(value),
  },
  { key: 'actions', label: 'Actions', width: '130px' },
]

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function needsToggle(message) {
  return String(message || '').length > TRUNCATE_AT
}

function isExpanded(id) {
  return expandedIds.value.has(String(id))
}

function toggleExpanded(id) {
  const key = String(id)
  const next = new Set(expandedIds.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedIds.value = next
}

function openReply(message) {
  replyTarget.value = message
  replyText.value = `Hi ${message.name}, `
  replyError.value = ''
  replyOpen.value = true
}

function closeReply() {
  if (sending.value) return
  replyOpen.value = false
  replyTarget.value = null
  replyText.value = ''
  replyError.value = ''
}

async function sendReply() {
  replyError.value = ''
  const text = replyText.value.trim()

  if (!text) {
    replyError.value = 'Reply text is required'
    return
  }

  if (!replyTarget.value?._id) return

  sending.value = true

  try {
    const response = await api(`/api/contact/${replyTarget.value._id}/reply`, {
      method: 'POST',
      body: { replyText: text },
    })

    const updated = response?.data
    if (updated) {
      const index = messages.value.findIndex((item) => item._id === updated._id)
      if (index !== -1) {
        messages.value[index] = { ...messages.value[index], ...updated }
      }
    } else {
      const index = messages.value.findIndex((item) => item._id === replyTarget.value._id)
      if (index !== -1) {
        messages.value[index] = {
          ...messages.value[index],
          replied: true,
          replyMessage: text,
          repliedAt: new Date().toISOString(),
        }
      }
    }

    $toast?.success('Reply sent!')
    sending.value = false
    closeReply()
  } catch (error) {
    replyError.value =
      error?.data?.message || error?.message || 'Could not send reply'
    $toast?.error(replyError.value)
  } finally {
    sending.value = false
  }
}

async function fetchMessages() {
  initialLoading.value = true
  loadError.value = ''

  try {
    const response = await api('/api/contact')
    messages.value = response?.data || []
  } catch (error) {
    loadError.value =
      error?.data?.message || error?.message || 'Could not load messages'
    messages.value = []
  } finally {
    initialLoading.value = false
  }
}

await fetchMessages()
</script>

<style scoped lang="scss">
.admin-messages__name {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.admin-messages__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: #e5f0e9;
  color: var(--color-brand-dark);
  border: 1px solid #b7d4c4;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.admin-messages__email {
  color: var(--color-brand);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
}

.admin-messages__body {
  p {
    margin: 0;
    color: var(--color-ink);
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  p.is-clamped {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    white-space: normal;
  }
}

.admin-messages__more {
  margin-top: 0.35rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-brand);
  font: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
}
</style>

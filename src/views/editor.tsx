import { useEffect, useState, type ReactNode } from 'react'
import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, SizableText, Paragraph, Input, TextArea, Button, Separator, Spinner } from '@hanzo/gui'
import type { Entry, Profile } from '../lib/models'
import { SECTIONS, orderSections } from '../lib/sections'

/**
 * The editor — the write surface. Upserts the single `profile` row and
 * appends/removes `entries`, each write scoped to the signed-in org via the IAM
 * token wired in providers.tsx. Longhand Tamagui props throughout.
 */
export function Editor() {
  return (
    <YStack width="100%" maxWidth={780} alignSelf="center" gap="$6" paddingVertical="$6">
      <ProfileForm />
      <EntriesForm />
    </YStack>
  )
}

/* ------------------------------------------------------------------ profile */

function ProfileForm() {
  const profiles = useQuery<Profile>('profile', { sort: '-created', realtime: false })
  const profile = profiles.data[0]
  const createProfile = useMutation('profile', 'create')
  const updateProfile = useMutation('profile', 'update')
  const saving = createProfile.isLoading || updateProfile.isLoading

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')

  // Seed the form once the live profile arrives.
  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setTitle(profile.title)
      setSummary(profile.summary)
    }
  }, [profile?.id])

  async function save() {
    const n = name.trim()
    const t = title.trim()
    if (!n || !t || saving) return
    const fields = { name: n, title: t, summary: summary.trim() }
    if (profile) await updateProfile.mutate({ id: profile.id, ...fields })
    else await createProfile.mutate(fields)
    await profiles.refetch()
  }

  const error = createProfile.error || updateProfile.error

  return (
    <Panel title="Header" hint="Your name, role and a one-paragraph summary.">
      <Field label="Full name">
        <Input size="$4" value={name} placeholder="Ada Lovelace" onChangeText={setName} />
      </Field>
      <Field label="Title">
        <Input size="$4" value={title} placeholder="Mathematician · First Programmer" onChangeText={setTitle} />
      </Field>
      <Field label="Summary">
        <TextArea
          value={summary}
          minHeight={110}
          placeholder="A sentence or two on who you are and what you do best."
          onChangeText={setSummary}
        />
      </Field>
      {error ? <Paragraph color="$red10">{error.message}</Paragraph> : null}
      <XStack>
        <Button size="$4" theme="active" disabled={saving || !name.trim() || !title.trim()} onPress={save}>
          {saving ? 'Saving…' : profile ? 'Save header' : 'Create header'}
        </Button>
      </XStack>
    </Panel>
  )
}

/* ------------------------------------------------------------------ entries */

function EntriesForm() {
  const entries = useQuery<Entry>('entries', { sort: 'created', realtime: false, perPage: 200 })
  const addEntry = useMutation('entries', 'create')
  const removeEntry = useMutation('entries', 'delete')

  const [section, setSection] = useState<string>(SECTIONS[0])
  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('')
  const [detail, setDetail] = useState('')

  async function add() {
    const t = title.trim()
    if (!t || addEntry.isLoading) return
    await addEntry.mutate({ section, title: t, when: when.trim(), detail: detail.trim() })
    setTitle('')
    setWhen('')
    setDetail('')
    await entries.refetch()
  }

  async function del(id: string) {
    await removeEntry.mutate({ id })
    await entries.refetch()
  }

  const groups: Record<string, Entry[]> = {}
  for (const e of entries.data) (groups[e.section] ||= []).push(e)
  const sections = orderSections(Object.keys(groups))

  return (
    <Panel title="Entries" hint="One line item per role, project, skill or credential.">
      {/* Add form */}
      <Field label="Section">
        <XStack gap="$2" flexWrap="wrap">
          {SECTIONS.map((s) => {
            const on = section === s
            return (
              <Button
                key={s}
                size="$3"
                borderWidth={1}
                borderColor="$borderColor"
                backgroundColor={on ? '$color12' : 'transparent'}
                onPress={() => setSection(s)}
              >
                <Button.Text fontSize={14} fontWeight="600" color={on ? '$background' : '$color11'}>
                  {s}
                </Button.Text>
              </Button>
            )
          })}
        </XStack>
      </Field>
      <XStack gap="$3" flexWrap="wrap">
        <YStack flex={2} minWidth={220}>
          <Field label="Title">
            <Input size="$4" value={title} placeholder="Senior Engineer, Acme" onChangeText={setTitle} />
          </Field>
        </YStack>
        <YStack flex={1} minWidth={140}>
          <Field label="When">
            <Input size="$4" value={when} placeholder="2021 – Present" onChangeText={setWhen} />
          </Field>
        </YStack>
      </XStack>
      <Field label="Detail">
        <TextArea
          value={detail}
          minHeight={80}
          placeholder="What you did and the outcome. Keep it tight."
          onChangeText={setDetail}
        />
      </Field>
      {addEntry.error ? <Paragraph color="$red10">{addEntry.error.message}</Paragraph> : null}
      <XStack>
        <Button size="$4" theme="active" disabled={addEntry.isLoading || !title.trim()} onPress={add}>
          {addEntry.isLoading ? 'Adding…' : 'Add entry'}
        </Button>
      </XStack>

      <Separator marginVertical="$2" borderColor="$color6" />

      {/* Existing entries, grouped */}
      {entries.isLoading ? (
        <XStack gap="$2" alignItems="center" opacity={0.6}>
          <Spinner />
          <SizableText color="$color10">Loading…</SizableText>
        </XStack>
      ) : entries.data.length === 0 ? (
        <Paragraph fontSize={15} color="$color10">
          No entries yet — add your first above.
        </Paragraph>
      ) : (
        <YStack gap="$5">
          {sections.map((s) => (
            <YStack key={s} gap="$3">
              <SizableText fontSize={12} fontWeight="700" letterSpacing={2} textTransform="uppercase" color="$color10">
                {s}
              </SizableText>
              {groups[s].map((e) => (
                <XStack
                  key={e.id}
                  gap="$3"
                  padding="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$4"
                  alignItems="flex-start"
                  justifyContent="space-between"
                >
                  <YStack flex={1} gap="$1">
                    <XStack gap="$3" alignItems="baseline" justifyContent="space-between">
                      <SizableText fontSize={16} fontWeight="600" color="$color12">
                        {e.title}
                      </SizableText>
                      {e.when ? (
                        <SizableText fontSize={13} color="$color10">
                          {e.when}
                        </SizableText>
                      ) : null}
                    </XStack>
                    {e.detail ? (
                      <Paragraph fontSize={14} lineHeight={20} color="$color11">
                        {e.detail}
                      </Paragraph>
                    ) : null}
                  </YStack>
                  <Button size="$2" chromeless disabled={removeEntry.isLoading} onPress={() => del(e.id)}>
                    Delete
                  </Button>
                </XStack>
              ))}
            </YStack>
          ))}
        </YStack>
      )}
    </Panel>
  )
}

/* ------------------------------------------------------------------- shared */

function Panel({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <YStack
      gap="$4"
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$6"
      paddingHorizontal="$6"
      paddingVertical="$6"
    >
      <YStack gap="$1">
        <SizableText fontSize={20} fontWeight="700" color="$color12">
          {title}
        </SizableText>
        <SizableText fontSize={14} color="$color10">
          {hint}
        </SizableText>
      </YStack>
      {children}
    </YStack>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <YStack gap="$2">
      <SizableText fontSize={12} fontWeight="700" letterSpacing={1} textTransform="uppercase" color="$color10">
        {label}
      </SizableText>
      {children}
    </YStack>
  )
}

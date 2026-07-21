import type { ReactNode } from 'react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, H1, SizableText, Paragraph, Button, Spinner, Separator } from '@hanzo/gui'
import type { Entry, Profile } from '../lib/models'
import { orderSections } from '../lib/sections'

/**
 * The resume — the read surface. Renders the single `profile` header and every
 * `entry` grouped by section, in one centered, typographic column that prints as
 * a clean page. Longhand Tamagui props throughout (tsc enforces it).
 */
export function Resume({ onEdit }: { onEdit: () => void }) {
  const profiles = useQuery<Profile>('profile', { sort: '-created', realtime: false })
  const entries = useQuery<Entry>('entries', { sort: 'created', realtime: false, perPage: 200 })
  const profile = profiles.data[0]

  if (profiles.isLoading || entries.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$10">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (profiles.error) {
    return (
      <Paper>
        <Paragraph color="$red10">
          Couldn’t reach Base ({profiles.error.message}). Confirm VITE_HANZO_BASE_URL and that you’re signed in.
        </Paragraph>
      </Paper>
    )
  }

  if (!profile) {
    return (
      <Paper>
        <YStack alignItems="center" gap="$4" paddingVertical="$8">
          <SizableText fontSize={22} fontWeight="700" color="$color12">
            Your resume is a blank page
          </SizableText>
          <Paragraph textAlign="center" fontSize={16} color="$color10" maxWidth={420}>
            Add your name, a headline and your experience in the editor. It saves to Base, scoped to your org, and
            reads back here.
          </Paragraph>
          <Button size="$4" theme="active" onPress={onEdit}>
            Open the editor
          </Button>
        </YStack>
      </Paper>
    )
  }

  const groups: Record<string, Entry[]> = {}
  for (const e of entries.data) (groups[e.section] ||= []).push(e)
  const sections = orderSections(Object.keys(groups))

  return (
    <Paper>
      {/* Header — name, role line, summary. */}
      <YStack gap="$2">
        <H1 fontSize={44} lineHeight={48} fontWeight="800" letterSpacing={-1} color="$color12">
          {profile.name}
        </H1>
        <SizableText fontSize={15} letterSpacing={3} textTransform="uppercase" color="$color11">
          {profile.title}
        </SizableText>
        {profile.summary ? (
          <Paragraph fontSize={16} lineHeight={26} color="$color11" maxWidth={620} marginTop="$2">
            {profile.summary}
          </Paragraph>
        ) : null}
      </YStack>

      <Separator marginVertical="$6" borderColor="$color6" />

      {sections.length === 0 ? (
        <Paragraph fontSize={15} color="$color10">
          No entries yet — add your experience, projects and skills in the editor.
        </Paragraph>
      ) : (
        <YStack gap="$8">
          {sections.map((section) => (
            <SectionBlock key={section} name={section} items={groups[section]} />
          ))}
        </YStack>
      )}
    </Paper>
  )
}

/** The paper: one centered column with a soft, printable card treatment. */
function Paper({ children }: { children: ReactNode }) {
  return (
    <YStack
      width="100%"
      maxWidth={780}
      alignSelf="center"
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$6"
      paddingHorizontal="$8"
      paddingVertical="$9"
      marginVertical="$6"
      shadowColor="$shadowColor"
      shadowRadius={24}
      shadowOffset={{ width: 0, height: 8 }}
    >
      {children}
    </YStack>
  )
}

/** One resume section: a tracked label with a hairline, then its line items. */
function SectionBlock({ name, items }: { name: string; items: Entry[] }) {
  return (
    <YStack gap="$4">
      <YStack gap="$2">
        <SizableText fontSize={13} fontWeight="700" letterSpacing={2.5} textTransform="uppercase" color="$color10">
          {name}
        </SizableText>
        <Separator borderColor="$color6" />
      </YStack>
      <YStack gap="$5">
        {items.map((item) => (
          <YStack key={item.id} gap="$1">
            <XStack justifyContent="space-between" alignItems="flex-start" gap="$4">
              <SizableText flex={1} fontSize={17} fontWeight="600" color="$color12">
                {item.title}
              </SizableText>
              {item.when ? (
                <SizableText fontSize={14} color="$color10">
                  {item.when}
                </SizableText>
              ) : null}
            </XStack>
            {item.detail ? (
              <Paragraph fontSize={15} lineHeight={23} color="$color11">
                {item.detail}
              </Paragraph>
            ) : null}
          </YStack>
        ))}
      </YStack>
    </YStack>
  )
}

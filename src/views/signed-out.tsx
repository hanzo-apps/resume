import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, SizableText, Paragraph, Button, Separator } from '@hanzo/gui'

/**
 * Signed-out landing — the pre-auth pitch. A typographic hero beside a live
 * preview of the resume the app builds. One action: PKCE sign-in with Hanzo
 * (hanzo.id); Hanzo IAM owns every credential interaction (no local form).
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" padding="$6" backgroundColor="$color2">
      <XStack
        width="100%"
        maxWidth={1040}
        gap="$10"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
      >
        {/* Pitch */}
        <YStack flex={1} minWidth={300} maxWidth={520} gap="$5">
          <SizableText fontSize={13} fontWeight="700" letterSpacing={3} textTransform="uppercase" color="$color10">
            Hanzo · Resume
          </SizableText>
          <YStack gap="$3">
            <H1 fontSize={64} lineHeight={62} fontWeight="800" letterSpacing={-2} color="$color12">
              Curriculum
            </H1>
            <SizableText fontSize={22} lineHeight={30} color="$color11">
              A polished online resume — structured, ATS-clean, and print-ready.
            </SizableText>
          </YStack>
          <Paragraph fontSize={16} lineHeight={26} color="$color10" maxWidth={460}>
            Write your experience, projects and skills once. Curriculum keeps them in
            Hanzo Base, scoped to your org, and renders one clean typographic page you
            can share or print.
          </Paragraph>
          <XStack gap="$3" alignItems="center" flexWrap="wrap">
            <Button size="$5" theme="active" disabled={isLoading} onPress={() => login()}>
              {isLoading ? 'Loading…' : 'Sign in with Hanzo'}
            </Button>
            <SizableText fontSize={13} color="$color10">
              Experience · Projects · Skills · Education
            </SizableText>
          </XStack>
        </YStack>

        {/* Live preview of the resume paper */}
        <PreviewPaper />
      </XStack>
    </YStack>
  )
}

/** A miniature of the real resume paper, rendered with the same primitives. */
function PreviewPaper() {
  return (
    <YStack
      flex={1}
      minWidth={320}
      maxWidth={420}
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$7"
      paddingHorizontal="$7"
      paddingVertical="$7"
      gap="$4"
      shadowColor="$shadowColor"
      shadowRadius={30}
      shadowOffset={{ width: 0, height: 12 }}
    >
      <YStack gap="$2">
        <SizableText fontSize={30} fontWeight="800" letterSpacing={-1} color="$color12">
          Ada Lovelace
        </SizableText>
        <SizableText fontSize={12} letterSpacing={2.5} textTransform="uppercase" color="$color11">
          Mathematician · First Programmer
        </SizableText>
        <Paragraph fontSize={13} lineHeight={20} color="$color11">
          Analyst of the Analytical Engine; wrote what is regarded as the first
          published algorithm intended for a machine.
        </Paragraph>
      </YStack>

      <Separator borderColor="$color6" />

      <PreviewSection
        label="Experience"
        title="Notes on the Analytical Engine"
        when="1843"
        detail="Translated and extended Menabrea’s memoir with the first machine algorithm."
      />
      <PreviewSection
        label="Skills"
        title="Analysis · Symbolic logic"
        when=""
        detail="Technical writing, mathematics, computational thinking."
      />
    </YStack>
  )
}

function PreviewSection({
  label,
  title,
  when,
  detail,
}: {
  label: string
  title: string
  when: string
  detail: string
}) {
  return (
    <YStack gap="$2">
      <SizableText fontSize={11} fontWeight="700" letterSpacing={2} textTransform="uppercase" color="$color10">
        {label}
      </SizableText>
      <XStack justifyContent="space-between" alignItems="baseline" gap="$3">
        <SizableText flex={1} fontSize={14} fontWeight="600" color="$color12">
          {title}
        </SizableText>
        {when ? (
          <SizableText fontSize={12} color="$color10">
            {when}
          </SizableText>
        ) : null}
      </XStack>
      <Paragraph fontSize={12} lineHeight={18} color="$color11">
        {detail}
      </Paragraph>
    </YStack>
  )
}

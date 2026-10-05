import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native'
import {
  colors,
  fontFamilies,
  layout,
  MINIMUM_TOUCH_TARGET_SIZE,
  radii,
  spacing,
  textStyles,
} from '../../theme'
import { Icon } from './Icon'

// The arrow is drawn small, but its press area still meets the minimum touch target.
const ARROW_HIT_SLOP = (MINIMUM_TOUCH_TARGET_SIZE - layout.textFieldArrowSize) / 2

type TextFieldProps = Pick<
  TextInputProps,
  'autoCapitalize' | 'autoCorrect' | 'spellCheck' | 'keyboardType'
> & {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  /** Shown under the field, which turns red. `null` when the value is fine. */
  errorMessage?: string | null
  /** `mono` for addresses and numbers (design-system.md §3.1). */
  valueFont?: 'text' | 'mono'
  /** Shows the trailing arrow button, like Lusion's newsletter field. */
  onSubmitPress?: () => void
  isSubmitDisabled?: boolean
  submitAccessibilityLabel?: string
}

/** design-system.md §8: an off-white field on a white panel, with an optional arrow to submit. */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  errorMessage = null,
  valueFont = 'text',
  onSubmitPress,
  isSubmitDisabled = false,
  submitAccessibilityLabel = 'Submit',
  ...textInputProps
}: TextFieldProps) {
  const hasError = errorMessage !== null
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, hasError && styles.fieldInvalid]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          accessibilityLabel={label}
          style={[styles.input, valueFont === 'mono' && styles.inputMono]}
          {...textInputProps}
        />
        {onSubmitPress !== undefined && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={submitAccessibilityLabel}
            accessibilityState={{ disabled: isSubmitDisabled }}
            disabled={isSubmitDisabled}
            onPress={onSubmitPress}
            hitSlop={ARROW_HIT_SLOP}
          >
            <Icon
              name="arrowRight"
              size={layout.textFieldArrowSize}
              color={isSubmitDisabled ? colors.textPlaceholder : colors.accent}
            />
          </Pressable>
        )}
      </View>
      {hasError && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.small,
  },
  label: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  field: {
    minHeight: layout.textFieldHeight,
    paddingHorizontal: spacing.large,
    borderRadius: radii.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.background,
  },
  fieldInvalid: {
    backgroundColor: colors.dangerSurface,
  },
  input: {
    ...textStyles.input,
    flex: 1,
    paddingVertical: spacing.small,
    color: colors.textPrimary,
  },
  inputMono: {
    fontFamily: fontFamilies.monoRegular,
  },
  error: {
    ...textStyles.caption,
    color: colors.danger,
  },
})

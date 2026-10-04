import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { colors, radius } from './theme';

type IconName = {
  ios: string;
  android: string;
  web?: string;
};

export function Icon({ name, size = 20, color = colors.brand }: { name: IconName; size?: number; color?: string }) {
  return (
    <SymbolView
      name={{ ios: name.ios, android: name.android, web: name.web ?? name.android } as never}
      tintColor={color}
      size={size}
      fallback={<Text style={{ color, fontSize: size * 0.8 }}>•</Text>}
    />
  );
}

export const icons = {
  back: { ios: 'chevron.left', android: 'chevron_left' },
  next: { ios: 'chevron.right', android: 'chevron_right' },
  paw: { ios: 'pawprint.fill', android: 'pets' },
  calendar: { ios: 'calendar', android: 'calendar_month' },
  euro: { ios: 'eurosign.circle', android: 'euro' },
  person: { ios: 'person.fill', android: 'person' },
  people: { ios: 'person.2.fill', android: 'group' },
  edit: { ios: 'pencil', android: 'edit' },
  trash: { ios: 'trash', android: 'delete' },
  gear: { ios: 'gearshape', android: 'settings' },
  info: { ios: 'info.circle', android: 'info' },
  history: { ios: 'clock.arrow.circlepath', android: 'history' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  wallet: { ios: 'wallet.bifold', android: 'account_balance_wallet' },
  heart: { ios: 'heart', android: 'favorite' },
  weight: { ios: 'scalemass', android: 'monitor_weight' },
  home: { ios: 'house', android: 'home' },
  receipt: { ios: 'receipt', android: 'receipt_long' },
  more: { ios: 'ellipsis', android: 'more_horiz' },
};

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({ label, onPress, disabled = false, icon }: { label: string; onPress: () => void; disabled?: boolean; icon?: IconName }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
    >
      {icon ? <Icon name={icon} size={18} color="#fff" /> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: IconName }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
      {icon ? <Icon name={icon} size={18} /> : null}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Metric({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}><Icon name={icon} size={20} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <View style={styles.infoBox}>
      <Icon name={icons.info} size={20} color={colors.infoText} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  secondaryButtonText: { color: colors.brandDark, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.45 },
  metric: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  metricIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { color: colors.muted, fontSize: 12, marginBottom: 3 },
  metricValue: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: colors.info, borderRadius: radius.md, padding: 13, alignItems: 'flex-start' },
});

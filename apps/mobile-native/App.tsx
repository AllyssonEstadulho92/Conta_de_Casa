import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  createCareRecord,
  deleteCareRecord,
  loadPetShareSnapshot,
  markOutstandingAsReceived,
  saveMonthSettings,
  updateCareRecord,
  type CareRecord,
  type PetShareSnapshot,
} from './src/repository';
import type { CalculationMode } from './src/domain';
import {
  AnimalsScreen,
  CalendarScreen,
  EditRecordScreen,
  HandoverScreen,
  RecordsScreen,
  SettingsScreen,
} from './src/screens';
import { Icon, icons } from './src/ui';
import { colors } from './src/theme';

type ScreenName = 'animals' | 'handover' | 'calendar' | 'records' | 'settings' | 'edit';

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const titles: Record<Exclude<ScreenName, 'animals'>, string> = {
  handover: 'Entregar o Walli ao Nuno',
  calendar: 'Dias com o Nuno',
  records: 'Registos com o Nuno',
  settings: 'Configurações da partilha',
  edit: 'Editar registo',
};

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('animals');
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [snapshot, setSnapshot] = useState<PetShareSnapshot | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const next = await loadPetShareSnapshot(monthKey);
      setSnapshot(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível abrir os dados locais.');
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => { setLoading(true); void refresh(); }, [refresh]);

  const navigate = useCallback((next: ScreenName, recordId?: string) => {
    setSelectedRecordId(recordId ?? null);
    setScreen(next);
  }, []);

  const selectedRecord = useMemo<CareRecord | null>(() => {
    if (!snapshot || !selectedRecordId) return null;
    return snapshot.records.find(record => record.id === selectedRecordId) ?? null;
  }, [snapshot, selectedRecordId]);

  const createRecord = async (start: string, end: string, note: string) => {
    await createCareRecord(start, end, note);
    await refresh();
    setScreen('animals');
  };

  const updateRecord = async (id: string, start: string, end: string, note: string) => {
    await updateCareRecord(id, start, end, note);
    await refresh();
    setScreen('records');
  };

  const removeRecord = async (id: string) => {
    await deleteCareRecord(id);
    await refresh();
    setScreen('records');
  };

  const saveSettings = async (mode: CalculationMode, baseCents: number, dailyRateCents: number) => {
    await saveMonthSettings(monthKey, { calculationMode: mode, baseCents, dailyRateCents });
    await refresh();
    Alert.alert('Configuração guardada', 'O cálculo deste mês foi atualizado sem alterar os meses anteriores.');
  };

  const receiveOutstanding = async () => {
    if (!snapshot?.outstandingCents) return;
    Alert.alert(
      'Confirmar recebimento',
      'O valor em falta será registado como reembolso recebido. A despesa original não é alterada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => void (async () => {
            try {
              await markOutstandingAsReceived(monthKey);
              await refresh();
            } catch (err) {
              Alert.alert('Não foi possível registar', err instanceof Error ? err.message : 'Erro inesperado.');
            }
          })(),
        },
      ],
    );
  };

  if (loading && !snapshot) {
    return <SafeAreaView style={styles.loading}><StatusBar barStyle="dark-content" /><ActivityIndicator color={colors.brand} size="large" /><Text style={styles.loadingText}>A preparar a partilha do Walli…</Text></SafeAreaView>;
  }

  if (error || !snapshot) {
    return (
      <SafeAreaView style={styles.errorPage}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.errorTitle}>Não foi possível abrir a aplicação móvel.</Text>
        <Text style={styles.errorText}>{error ?? 'Erro desconhecido.'}</Text>
        <Text style={styles.errorHint}>Esta versão usa SQLite com SQLCipher e deve ser executada como build nativa de desenvolvimento ou produção. O Expo Go não suporta SQLCipher.</Text>
        <Pressable style={styles.retry} onPress={() => void refresh()}><Text style={styles.retryText}>Tentar novamente</Text></Pressable>
      </SafeAreaView>
    );
  }

  const common = { snapshot, monthKey, setMonthKey, navigate, refresh };

  let content;
  switch (screen) {
    case 'handover':
      content = <HandoverScreen {...common} createRecord={createRecord} />;
      break;
    case 'calendar':
      content = <CalendarScreen {...common} />;
      break;
    case 'records':
      content = <RecordsScreen {...common} />;
      break;
    case 'settings':
      content = <SettingsScreen {...common} saveSettings={saveSettings} />;
      break;
    case 'edit':
      content = selectedRecord
        ? <EditRecordScreen {...common} record={selectedRecord} updateRecord={updateRecord} deleteRecord={removeRecord} />
        : <RecordsScreen {...common} />;
      break;
    default:
      content = <AnimalsScreen {...common} markReceived={receiveOutstanding} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={screen === 'animals' ? 'light-content' : 'light-content'} backgroundColor={colors.brandDark} />
      {screen !== 'animals' ? (
        <View style={styles.header}>
          <Pressable onPress={() => setScreen(screen === 'edit' ? 'records' : 'animals')} style={styles.headerButton} accessibilityLabel="Voltar">
            <Icon name={icons.back} size={23} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{titles[screen]}</Text>
          <View style={styles.headerButton} />
        </View>
      ) : null}
      <View style={styles.content}>{content}</View>
      {screen === 'animals' ? <BottomNav /> : null}
    </SafeAreaView>
  );
}

function BottomNav() {
  const unavailable = () => Alert.alert('Migração nativa', 'Nesta entrega fica ativa a área Animais. Os restantes módulos serão migrados sem reaproveitar a interface web.');
  return (
    <View style={styles.bottomNav}>
      <NavItem label="Início" icon={icons.home} onPress={unavailable} />
      <NavItem label="Despesas" icon={icons.receipt} onPress={unavailable} />
      <NavItem label="Animais" icon={icons.paw} active onPress={() => undefined} />
      <NavItem label="Mais" icon={icons.more} onPress={unavailable} />
    </View>
  );
}

function NavItem({ label, icon, active = false, onPress }: { label: string; icon: typeof icons.paw; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.navItem} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <Icon name={icon} size={22} color={active ? colors.brand : '#71838C'} />
      <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.brandDark, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0 },
  content: { flex: 1, backgroundColor: colors.canvas },
  header: { height: 58, backgroundColor: colors.brandDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  headerButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 17, fontWeight: '800' },
  bottomNav: { minHeight: 68, backgroundColor: '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#D9E4E5', flexDirection: 'row', paddingBottom: Platform.OS === 'ios' ? 6 : 4 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 58 },
  navText: { color: '#71838C', fontSize: 11, fontWeight: '600' },
  navTextActive: { color: colors.brand, fontWeight: '800' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: colors.canvas, padding: 24 },
  loadingText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  errorPage: { flex: 1, justifyContent: 'center', padding: 28, backgroundColor: colors.canvas },
  errorTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', marginBottom: 10 },
  errorText: { color: '#A12B2B', fontSize: 14, lineHeight: 20 },
  errorHint: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 12 },
  retry: { marginTop: 20, backgroundColor: colors.brand, minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  retryText: { color: '#fff', fontWeight: '800' },
});

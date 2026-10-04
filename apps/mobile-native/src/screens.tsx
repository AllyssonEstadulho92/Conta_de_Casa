import { useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  allocateProportionalShareByDays,
  calculateShareCents,
  enumerateDateKeysInclusive,
  parseEuroToCents,
  type CalculationMode,
} from './domain';
import type { CareRecord, PetShareSnapshot } from './repository';
import { Card, Icon, InfoBox, Metric, PrimaryButton, SecondaryButton, icons } from './ui';
import { colors, radius } from './theme';

type ScreenName = 'animals' | 'share' | 'handover' | 'calendar' | 'records' | 'settings' | 'edit';
type CommonProps = {
  snapshot: PetShareSnapshot;
  monthKey: string;
  setMonthKey: (value: string) => void;
  navigate: (screen: ScreenName, recordId?: string) => void;
  refresh: () => Promise<void>;
};

function euro(cents: number): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}
function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function dateFromKey(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y ?? 2000, (m ?? 1) - 1, d ?? 1, 12);
}
function monthTitle(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(new Date(y ?? 2000, (m ?? 1) - 1, 1));
}
function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y ?? 2000, (m ?? 1) - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function daysOfRecordInMonth(record: CareRecord, monthKey: string): number {
  return enumerateDateKeysInclusive(record.startDate, record.endDate).filter(key => key.startsWith(monthKey)).length;
}
function allocations(snapshot: PetShareSnapshot): Map<string, number> {
  const counts = snapshot.records.map(record => daysOfRecordInMonth(record, snapshot.month.monthKey));
  const values = snapshot.month.calculationMode === 'proportional'
    ? allocateProportionalShareByDays(snapshot.month.baseCents, counts, snapshot.daysInMonth)
    : counts.map(days => days * snapshot.month.dailyRateCents);
  return new Map(snapshot.records.map((record, index) => [record.id, values[index] ?? 0]));
}

function MonthPicker({ monthKey, onChange }: { monthKey: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.monthPicker}>
      <Pressable accessibilityLabel="Mês anterior" style={styles.iconButton} onPress={() => onChange(shiftMonth(monthKey, -1))}>
        <Icon name={icons.back} size={20} color={colors.ink} />
      </Pressable>
      <Text style={styles.monthText}>{monthTitle(monthKey)}</Text>
      <Pressable accessibilityLabel="Mês seguinte" style={styles.iconButton} onPress={() => onChange(shiftMonth(monthKey, 1))}>
        <Icon name={icons.next} size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
}

function SummaryRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <View style={[styles.summaryRow, emphasis && styles.summaryRowEmphasis]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, emphasis && styles.summaryValueEmphasis]}>{value}</Text>
    </View>
  );
}

function CalendarGrid({ snapshot }: { snapshot: PetShareSnapshot }) {
  const [year, month] = snapshot.month.monthKey.split('-').map(Number);
  const first = new Date(year ?? 2000, (month ?? 1) - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const marked = new Set(snapshot.careDays);
  const cells: number[] = Array.from({ length: offset }, () => 0);
  for (let day = 1; day <= snapshot.daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7) cells.push(0);
  return (
    <View>
      <View style={styles.weekRow}>
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(label => <Text key={label} style={styles.weekLabel}>{label}</Text>)}
      </View>
      <View style={styles.calendarGrid}>
        {cells.map((day, index) => {
          if (!day) return <View key={`blank-${index}`} style={styles.dayCell} />;
          const key = `${snapshot.month.monthKey}-${String(day).padStart(2, '0')}`;
          const active = marked.has(key);
          return (
            <View key={key} style={[styles.dayCell, active && styles.dayCellActive]}>
              <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
              {active ? <View style={styles.dayDot} /> : null}
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#6FD3CA' }]} /><Text style={styles.muted}>Dia com o Nuno</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#E3ECEC' }]} /><Text style={styles.muted}>Dia do proprietário</Text></View>
      </View>
    </View>
  );
}

export function AnimalsScreen({ snapshot, monthKey, navigate }: CommonProps) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CONTA DE CASA</Text>
        <Text style={styles.heroTitle}>Animais</Text>
        <Text style={styles.heroSubtitle}>Perfis, cuidados e gestão dos seus animais.</Text>
      </View>

      <View style={styles.tabs}>
        <View style={[styles.tab, styles.tabActive]}><Icon name={icons.paw} size={17} /><Text style={styles.tabActiveText}>Walli</Text></View>
        <View style={styles.tab}><Text style={styles.tabText}>Jade</Text></View>
        <View style={styles.tab}><Text style={styles.tabText}>Agendas</Text></View>
        <View style={styles.tab}><Text style={styles.tabText}>Saúde</Text></View>
      </View>

      <Card>
        <View style={styles.petRow}>
          <View style={styles.avatar}><Icon name={icons.paw} size={34} color={colors.brandDark} /></View>
          <View style={{ flex: 1 }}><Text style={styles.petName}>{snapshot.pet.name}</Text><Text style={styles.muted}>{snapshot.pet.species}</Text></View>
          <SecondaryButton label="Editar" icon={icons.edit} onPress={() => Alert.alert('Perfil do Walli', 'A edição do perfil fica preparada para uma fase seguinte da aplicação nativa.')} />
        </View>
        <View style={styles.metrics}>
          <Metric label="Idade" value="—" icon={icons.paw} />
          <Metric label="Peso" value="—" icon={icons.weight} />
          <Metric label="Última consulta" value="—" icon={icons.heart} />
        </View>
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.titleWithIcon}><Icon name={icons.people} size={22} /><Text style={styles.cardTitle}>Partilha do Walli</Text></View>
          <Text style={styles.listTotal}>{monthTitle(monthKey)}</Text>
        </View>
        <Text style={[styles.muted, { marginTop: 8 }]}>Secção dedicada aos dias em que o Walli fica com o Nuno, respetivos valores e reembolsos.</Text>
        <View style={styles.twoCols}>
          <View style={styles.smallBox}><Text style={styles.muted}>Dias com o Nuno</Text><Text style={styles.boxValue}>{snapshot.careDays.length} dias</Text></View>
          <View style={styles.smallBox}><Text style={styles.muted}>Por receber</Text><Text style={styles.boxValue}>{euro(snapshot.outstandingCents)}</Text></View>
        </View>
        <View style={{ height: 14 }} />
        <PrimaryButton label="Abrir partilha com o Nuno" icon={icons.people} onPress={() => navigate('share')} />
      </Card>
      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

export function WalliShareScreen({ snapshot, monthKey, setMonthKey, navigate, markReceived }: CommonProps & { markReceived: () => Promise<void> }) {
  const received = snapshot.paidCents > 0;
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>WALLI</Text>
        <Text style={styles.heroTitle}>Partilha com o Nuno</Text>
        <Text style={styles.heroSubtitle}>Dias de guarda, cálculo do valor e controlo de reembolsos.</Text>
      </View>

      <MonthPicker monthKey={monthKey} onChange={setMonthKey} />

      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.titleWithIcon}><Icon name={icons.wallet} size={22} /><Text style={styles.cardTitle}>Resumo da partilha</Text></View>
          <Pressable accessibilityLabel="Configurações" style={styles.iconButton} onPress={() => navigate('settings')}><Icon name={icons.gear} size={20} color={colors.ink} /></Pressable>
        </View>

        <View style={styles.baseBox}>
          <Text style={styles.muted}>Base mensal da partilha</Text>
          <Text style={styles.bigMoney}>{euro(snapshot.month.baseCents)}</Text>
        </View>

        <View style={styles.twoCols}>
          <View style={styles.smallBox}>
            <Text style={styles.muted}>Dias com o Nuno</Text>
            <Text style={styles.boxValue}>{snapshot.careDays.length} dias</Text>
            <Text style={styles.micro}>de {snapshot.daysInMonth} dias</Text>
          </View>
          <View style={styles.smallBox}>
            <Text style={styles.muted}>Valor do Nuno</Text>
            <Text style={styles.boxValue}>{euro(snapshot.caregiverShareCents)}</Text>
            <Text style={styles.micro}>{snapshot.month.calculationMode === 'proportional' ? 'Cálculo proporcional' : 'Valor diário fixo'}</Text>
          </View>
        </View>

        {snapshot.month.calculationMode === 'proportional' ? (
          <View style={styles.previewRow}>
            <Text style={styles.muted}>Parte do proprietário</Text>
            <Text style={styles.previewStrong}>{euro(snapshot.ownerShareCents)}</Text>
          </View>
        ) : null}

        <View style={[styles.statusBox, received && snapshot.outstandingCents === 0 && styles.statusBoxPaid]}>
          <View>
            <Text style={styles.statusLabel}>{snapshot.outstandingCents > 0 ? 'Por receber' : 'Estado da partilha'}</Text>
            <Text style={styles.statusAmount}>{snapshot.outstandingCents > 0 ? euro(snapshot.outstandingCents) : (received ? 'Liquidado' : 'Sem valor em falta')}</Text>
          </View>
          {snapshot.outstandingCents > 0 ? (
            <Pressable style={styles.receivedButton} onPress={() => void markReceived()}>
              <Icon name={icons.check} size={17} color="#fff" />
              <Text style={styles.receivedText}>Recebido</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ height: 14 }} />
        <PrimaryButton label="Registar entrega ao Nuno" icon={icons.calendar} onPress={() => navigate('handover')} />
        <View style={styles.quickActions}>
          <SecondaryButton label="Calendário" icon={icons.calendar} onPress={() => navigate('calendar')} />
          <SecondaryButton label="Registos" icon={icons.history} onPress={() => navigate('records')} />
        </View>
      </Card>

      <InfoBox>
        <Text style={styles.infoText}>Os valores recebidos do Nuno ficam registados como reembolso. A base mensal original não é reescrita.</Text>
      </InfoBox>
      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

export function CalendarScreen({ snapshot, monthKey, setMonthKey, navigate }: CommonProps) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <MonthPicker monthKey={monthKey} onChange={setMonthKey} />
      <Card><CalendarGrid snapshot={snapshot} /></Card>
      <Card>
        <View style={styles.titleWithIcon}><Icon name={icons.calendar} /><Text style={styles.cardTitle}>Resumo do mês</Text></View>
        <SummaryRow label="Total de dias no mês" value={`${snapshot.daysInMonth} dias`} />
        <SummaryRow label="Dias com o Nuno" value={`${snapshot.careDays.length} dias`} emphasis />
        <SummaryRow label="Dias do proprietário" value={`${snapshot.daysInMonth - snapshot.careDays.length} dias`} />
        <SummaryRow label="Base mensal" value={euro(snapshot.month.baseCents)} />
        <SummaryRow label={snapshot.month.calculationMode === 'proportional' ? `Valor do Nuno (${snapshot.careDays.length}/${snapshot.daysInMonth})` : 'Valor do Nuno'} value={euro(snapshot.caregiverShareCents)} emphasis />
        {snapshot.month.calculationMode === 'proportional' ? <SummaryRow label="Valor do proprietário" value={euro(snapshot.ownerShareCents)} /> : null}
      </Card>
      <PrimaryButton label="Registar entrega ao Nuno" icon={icons.calendar} onPress={() => navigate('handover')} />
    </ScrollView>
  );
}

export function RecordsScreen({ snapshot, monthKey, setMonthKey, navigate }: CommonProps) {
  const byRecord = useMemo(() => allocations(snapshot), [snapshot]);
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <MonthPicker monthKey={monthKey} onChange={setMonthKey} />
      <View style={styles.listHeader}><Text style={styles.cardTitle}>{monthTitle(monthKey)}</Text><Text style={styles.listTotal}>{snapshot.careDays.length} dias · {euro(snapshot.caregiverShareCents)}</Text></View>
      {snapshot.records.length ? snapshot.records.map(record => {
        const days = daysOfRecordInMonth(record, monthKey);
        return (
          <Card key={record.id} style={styles.recordCard}>
            <View style={styles.recordIcon}><Icon name={icons.calendar} size={20} color={colors.ink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recordDate}>{new Intl.DateTimeFormat('pt-PT').format(dateFromKey(record.startDate))}{record.startDate !== record.endDate ? ` – ${new Intl.DateTimeFormat('pt-PT').format(dateFromKey(record.endDate))}` : ''}</Text>
              <Text style={styles.muted}>{days} dia{days === 1 ? '' : 's'} neste mês{record.note ? ` · ${record.note}` : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}><Text style={styles.recordAmount}>{euro(byRecord.get(record.id) ?? 0)}</Text><Pressable style={styles.smallEdit} onPress={() => navigate('edit', record.id)}><Icon name={icons.edit} size={17} color={colors.brandDark} /></Pressable></View>
          </Card>
        );
      }) : <Card><Text style={styles.emptyTitle}>Ainda não existem registos neste mês.</Text><Text style={styles.muted}>Registe os dias em que o Walli fica com o Nuno.</Text></Card>}
      <PrimaryButton label="Novo registo" icon={icons.calendar} onPress={() => navigate('handover')} />
    </ScrollView>
  );
}

function RecordForm({
  snapshot,
  initialStart,
  initialEnd,
  initialNote,
  submitLabel,
  onSubmit,
  onDelete,
}: {
  snapshot: PetShareSnapshot;
  initialStart: string;
  initialEnd: string;
  initialNote: string;
  submitLabel: string;
  onSubmit: (start: string, end: string, note: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [start, setStart] = useState(dateFromKey(initialStart));
  const [end, setEnd] = useState(dateFromKey(initialEnd));
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const startKey = dateKey(start);
  const endKey = dateKey(end);
  const period = useMemo(() => {
    try { return enumerateDateKeysInclusive(startKey, endKey); } catch { return []; }
  }, [startKey, endKey]);
  const daysInMonth = period.filter(key => key.startsWith(snapshot.month.monthKey)).length;
  const preview = calculateShareCents({
    baseCents: snapshot.month.baseCents,
    careDays: daysInMonth,
    daysInMonth: snapshot.daysInMonth,
    mode: snapshot.month.calculationMode,
    dailyRateCents: snapshot.month.dailyRateCents,
  });
  const save = async () => {
    try {
      setSaving(true);
      await onSubmit(startKey, endKey, note);
    } catch (error) {
      Alert.alert('Não foi possível guardar', error instanceof Error ? error.message : 'Erro inesperado.');
    } finally { setSaving(false); }
  };
  return (
    <View style={{ gap: 16 }}>
      <InfoBox><Text style={styles.infoText}>Registe os dias em que o Walli fica com o Nuno. A aplicação impede dias duplicados e calcula o valor em cêntimos inteiros.</Text></InfoBox>
      <Card>
        <Text style={styles.formTitle}>Selecionar período</Text>
        <Text style={styles.inputLabel}>Data de início</Text>
        <View style={styles.dateBox}><Icon name={icons.calendar} size={19} color={colors.ink} /><DateTimePicker value={start} mode="date" display={Platform.OS === 'ios' ? 'compact' : 'default'} onChange={(_, value) => value && setStart(value)} /></View>
        <Text style={styles.inputLabel}>Data de fim</Text>
        <View style={styles.dateBox}><Icon name={icons.calendar} size={19} color={colors.ink} /><DateTimePicker value={end} minimumDate={start} mode="date" display={Platform.OS === 'ios' ? 'compact' : 'default'} onChange={(_, value) => value && setEnd(value)} /></View>
        <View style={styles.previewRow}><Text style={styles.muted}>Dias neste mês</Text><Text style={styles.previewStrong}>{daysInMonth} dias</Text></View>
        <View style={styles.previewRow}><Text style={styles.muted}>Valor previsto neste mês</Text><Text style={styles.previewStrong}>{euro(preview)}</Text></View>
        <Text style={styles.inputLabel}>Observação (opcional)</Text>
        <TextInput value={note} onChangeText={setNote} multiline maxLength={500} placeholder="Ex.: Walli com o Nuno neste fim de semana." style={styles.noteInput} />
      </Card>
      {onDelete ? <Pressable style={styles.deleteButton} onPress={() => Alert.alert('Eliminar registo?', 'Os dias associados serão removidos da partilha.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => void onDelete() }])}><Icon name={icons.trash} size={19} color={colors.danger} /><Text style={styles.deleteText}>Eliminar registo</Text></Pressable> : null}
      <PrimaryButton label={saving ? 'A guardar…' : submitLabel} onPress={() => void save()} disabled={saving || period.length === 0} />
    </View>
  );
}

export function HandoverScreen(props: CommonProps & { createRecord: (start: string, end: string, note: string) => Promise<void> }) {
  const today = new Date();
  const initial = dateKey(today).startsWith(props.monthKey) ? dateKey(today) : `${props.monthKey}-01`;
  return <ScrollView contentContainerStyle={styles.page}><Card style={styles.petCompact}><View style={styles.avatarSmall}><Icon name={icons.paw} size={25} color={colors.brandDark} /></View><View><Text style={styles.petName}>Walli</Text><Text style={styles.muted}>Cão · entrega ao Nuno</Text></View></Card><RecordForm snapshot={props.snapshot} initialStart={initial} initialEnd={initial} initialNote="" submitLabel="Guardar registo" onSubmit={props.createRecord} /></ScrollView>;
}

export function EditRecordScreen(props: CommonProps & {
  record: CareRecord;
  updateRecord: (id: string, start: string, end: string, note: string) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}) {
  return <ScrollView contentContainerStyle={styles.page}><RecordForm snapshot={props.snapshot} initialStart={props.record.startDate} initialEnd={props.record.endDate} initialNote={props.record.note} submitLabel="Guardar alterações" onSubmit={(start, end, note) => props.updateRecord(props.record.id, start, end, note)} onDelete={() => props.deleteRecord(props.record.id)} /></ScrollView>;
}

export function SettingsScreen({ snapshot, saveSettings }: CommonProps & { saveSettings: (mode: CalculationMode, baseCents: number, dailyRateCents: number) => Promise<void> }) {
  const [mode, setMode] = useState<CalculationMode>(snapshot.month.calculationMode);
  const [base, setBase] = useState((snapshot.month.baseCents / 100).toFixed(2).replace('.', ','));
  const [daily, setDaily] = useState((snapshot.month.dailyRateCents / 100).toFixed(2).replace('.', ','));
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    try {
      setSaving(true);
      await saveSettings(mode, parseEuroToCents(base), parseEuroToCents(daily));
    } catch (error) {
      Alert.alert('Dados inválidos', error instanceof Error ? error.message : 'Não foi possível guardar.');
    } finally { setSaving(false); }
  };
  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Card>
        <View style={styles.titleWithIcon}><Icon name={icons.gear} /><Text style={styles.cardTitle}>Cálculo do valor</Text></View>
        <Pressable onPress={() => setMode('proportional')} style={[styles.radioCard, mode === 'proportional' && styles.radioCardActive]}>
          <View style={[styles.radio, mode === 'proportional' && styles.radioActive]}>{mode === 'proportional' ? <View style={styles.radioInner} /> : null}</View>
          <View style={{ flex: 1 }}><Text style={styles.radioTitle}>Dividir pelo número de dias do mês</Text><Text style={styles.muted}>Valor = base mensal × dias com o Nuno ÷ dias reais do mês.</Text></View>
        </Pressable>
        <Pressable onPress={() => setMode('daily-fixed')} style={[styles.radioCard, mode === 'daily-fixed' && styles.radioCardActive]}>
          <View style={[styles.radio, mode === 'daily-fixed' && styles.radioActive]}>{mode === 'daily-fixed' ? <View style={styles.radioInner} /> : null}</View>
          <View style={{ flex: 1 }}><Text style={styles.radioTitle}>Valor diário fixo</Text><Text style={styles.muted}>Aplica um valor fixo por cada dia registado.</Text></View>
        </Pressable>
      </Card>
      <Card>
        <Text style={styles.formTitle}>Despesa mensal do Walli</Text>
        <Text style={styles.inputLabel}>Base mensal</Text>
        <View style={styles.moneyInputWrap}><Text style={styles.moneyPrefix}>€</Text><TextInput value={base} onChangeText={setBase} keyboardType="decimal-pad" style={styles.moneyInput} /></View>
        {mode === 'daily-fixed' ? <><Text style={styles.inputLabel}>Valor diário</Text><View style={styles.moneyInputWrap}><Text style={styles.moneyPrefix}>€</Text><TextInput value={daily} onChangeText={setDaily} keyboardType="decimal-pad" style={styles.moneyInput} /></View></> : null}
        <SummaryRow label="Dias neste mês" value={`${snapshot.daysInMonth} dias`} />
        <InfoBox><Text style={styles.infoText}>A configuração é guardada por mês. Alterações futuras não reescrevem automaticamente os meses anteriores.</Text></InfoBox>
      </Card>
      <PrimaryButton label={saving ? 'A guardar…' : 'Guardar configuração'} onPress={() => void submit()} disabled={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 14, paddingBottom: 36, backgroundColor: colors.canvas },
  hero: { backgroundColor: colors.brandDark, marginHorizontal: -16, marginTop: -16, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22 },
  eyebrow: { color: '#9DD7D2', fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  heroSubtitle: { color: '#D0E5E3', fontSize: 14, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, padding: 5, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  tab: { flex: 1, minHeight: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 10, flexDirection: 'row', gap: 5 },
  tabActive: { backgroundColor: colors.brandSoft },
  tabText: { color: colors.muted, fontSize: 12 },
  tabActiveText: { color: colors.brandDark, fontSize: 12, fontWeight: '800' },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E7F0E9', alignItems: 'center', justifyContent: 'center' },
  avatarSmall: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E7F0E9', alignItems: 'center', justifyContent: 'center' },
  petName: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  metrics: { flexDirection: 'row', gap: 10, marginTop: 18 },
  segment: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EEF3F3', borderRadius: 999, padding: 4 },
  segmentText: { color: colors.muted, fontSize: 12, paddingHorizontal: 8, paddingVertical: 9 },
  segmentActive: { flexDirection: 'row', gap: 5, backgroundColor: colors.brand, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  segmentActiveText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  cardTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21 },
  monthPicker: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 4 },
  monthText: { color: colors.ink, fontSize: 15, fontWeight: '800', textTransform: 'capitalize' },
  baseBox: { backgroundColor: '#F5F8F8', borderRadius: radius.md, padding: 14, marginTop: 10 },
  bigMoney: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 3 },
  twoCols: { flexDirection: 'row', gap: 10, marginTop: 10 },
  smallBox: { flex: 1, backgroundColor: '#F7FAFA', borderRadius: radius.md, padding: 13, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  boxValue: { color: colors.ink, fontSize: 18, fontWeight: '800', marginTop: 5 },
  micro: { color: colors.muted, fontSize: 11, marginTop: 2 },
  statusBox: { marginTop: 12, borderRadius: radius.md, backgroundColor: '#FFF7E8', padding: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBoxPaid: { backgroundColor: '#EAF8F1' },
  statusLabel: { color: colors.muted, fontSize: 12 },
  statusAmount: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 2 },
  receivedButton: { backgroundColor: colors.success, borderRadius: 999, minHeight: 38, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  receivedText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  quickActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  weekRow: { flexDirection: 'row', marginTop: 8 },
  weekLabel: { width: '14.2857%', textAlign: 'center', color: colors.muted, fontSize: 11 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  dayCell: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  dayCellActive: { backgroundColor: '#CFF2EE' },
  dayText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  dayTextActive: { color: colors.brandDark, fontWeight: '900' },
  dayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.brand, marginTop: 2 },
  legend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 13 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 13, height: 13, borderRadius: 7 },
  summaryRow: { minHeight: 46, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  summaryRowEmphasis: { backgroundColor: '#EFFAF8', marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 8 },
  summaryLabel: { color: colors.muted, fontSize: 13, flex: 1 },
  summaryValue: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  summaryValueEmphasis: { color: colors.brand },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 },
  listTotal: { color: colors.brand, fontSize: 13, fontWeight: '800' },
  recordCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  recordIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F0F5F5', alignItems: 'center', justifyContent: 'center' },
  recordDate: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  recordAmount: { color: colors.brand, fontSize: 14, fontWeight: '900' },
  smallEdit: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', marginBottom: 5 },
  petCompact: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { color: colors.infoText, fontSize: 13, lineHeight: 19 },
  formTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 2 },
  inputLabel: { color: colors.muted, fontSize: 12, marginTop: 12, marginBottom: 6 },
  dateBox: { minHeight: 50, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewRow: { minHeight: 46, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  previewStrong: { color: colors.brandDark, fontSize: 15, fontWeight: '900' },
  noteInput: { minHeight: 92, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 12, textAlignVertical: 'top', color: colors.ink, fontSize: 14 },
  deleteButton: { minHeight: 50, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: '#FFC9C9', borderRadius: radius.md, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: colors.danger, fontWeight: '800' },
  radioCard: { flexDirection: 'row', gap: 10, padding: 13, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, marginTop: 10 },
  radioCardActive: { borderColor: colors.brand, backgroundColor: '#F1FAF9' },
  radio: { width: 21, height: 21, borderRadius: 11, borderWidth: 2, borderColor: '#7B909A', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  radioActive: { borderColor: colors.brand },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.brand },
  radioTitle: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  moneyInputWrap: { minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  moneyPrefix: { color: colors.brand, fontSize: 20, fontWeight: '900', width: 28 },
  moneyInput: { flex: 1, color: colors.ink, fontSize: 17, fontWeight: '700', paddingVertical: 10 },
});

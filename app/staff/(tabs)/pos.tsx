import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, ChipRow, Sheet, Input, KV, Divider, QtyStepper, Segmented, Wrap } from '../../../src/components';
import { colors, radius } from '../../../src/theme';
import { useApp } from '../../../src/store/app';
import { images } from '../../../src/data/images';
import { shopService, productSync } from '../../../src/services/shopService';
import { staffService } from '../../../src/services/staffService';
import catalog from '../../../src/data/mock/catalog.json';

/** R11 Counter sale (POS) */
export default function Pos() {
  const { t, tr, money } = useI18n();
  const cart = useApp((s) => s.posCart);
  const members = useApp((s) => s.members);
  const [cat, setCat] = useState('all');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [pick, setPick] = useState(false);
  const [q, setQ] = useState('');
  const [method, setMethod] = useState<'cash' | 'terminal'>('cash');
  const [busy, setBusy] = useState(false);
  const m = members.find((x) => x.id === memberId);
  const disc = m ? ({ bronze: 0, silver: 5, gold: 10, platinum: 15 } as Record<string, number>)[m.tier] : 0;
  const tot = shopService.posTotals(cart, disc);
  const add = (id: string) => { const c = cart.slice(); const i = c.findIndex((x) => x.id === id); if (i >= 0) c[i] = { ...c[i], qty: c[i].qty + 1 }; else c.push({ id, qty: 1, opt: null }); useApp.getState().set({ posCart: c }); };
  const setQty = (i: number, n: number) => useApp.getState().set({ posCart: n ? cart.map((x, j) => (j === i ? { ...x, qty: n } : x)) : cart.filter((_, j) => j !== i) });
  const products = catalog.products.filter((p) => (cat === 'all' || p.cat === cat) && p.stock > 0);
  return (
    <Screen title={t('staff.posTitle')} header={{ back: false, right: cart.length ? <Button small full={false} variant="ghost" title={t('staff.clear')} onPress={() => useApp.getState().set({ posCart: [] })} /> : undefined }}
      footer={<Col gap={8}><Segmented items={[{ key: 'cash', label: t('pay.cash') }, { key: 'terminal', label: t('pay.terminal') }]} value={method} onChange={setMethod} /><Button testID="pos-charge" title={t('staff.charge', { a: money(tot.total) })} disabled={!cart.length} loading={busy} onPress={async () => { setBusy(true); const r = await staffService.sale(memberId, method); setBusy(false); router.push({ pathname: '/staff/sale-success', params: { r: JSON.stringify(r) } }); }} /></Col>}>
      <Pressable testID="pos-member" onPress={() => setPick(true)}>
        <Row gap={10} style={{ backgroundColor: m ? colors.black : colors.surface, borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: colors.border }}>
          <Icon name="person-circle-outline" color={m ? colors.yellow : colors.textMuted} />
          <T v="bodyStrong" color={m ? colors.onDark : colors.textMuted} style={{ flex: 1 }}>{m ? t('staff.attached', { name: tr(m.name), tier: t(`tier.${m.tier}`), n: disc }) : t('staff.attach')}</T>
          {m ? <Pressable onPress={() => setMemberId(null)}><Icon name="close-circle" color={colors.onDarkMuted} /></Pressable> : <Icon name="chevron-forward" size={18} color={colors.textSubtle} />}
        </Row>
      </Pressable>
      <ChipRow items={[{ key: 'all', label: t('common.all') }, ...catalog.productCategories.map((c) => ({ key: c.id, label: tr(c.name) }))]} value={cat} onChange={setCat} />
      <Wrap style={{ gap: 10 }}>
        {products.map((p) => (
          <Pressable testID={`pos-p-${p.id}`} key={p.id} onPress={() => add(p.id)} style={{ width: '31%', backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' }}>
            <Img src={images[p.img]} style={{ height: 80, width: '100%' }} />
            <Col style={{ padding: 8 }}><T v="micro" numberOfLines={2} style={{ minHeight: 34 }}>{tr(p.name)}</T><T v="captionStrong">{money(p.price)}</T></Col>
          </Pressable>
        ))}
      </Wrap>
      <Card>
        {!cart.length ? <T v="caption" center color={colors.textSubtle}>{t('staff.cartEmpty')}</T> : cart.map((c, i) => (
          <Row key={c.id} gap={10} style={{ paddingVertical: 6 }}>
            <T v="captionStrong" style={{ flex: 1 }} numberOfLines={1}>{tr(productSync(c.id).name)}</T>
            <QtyStepper small value={c.qty} min={0} onChange={(n) => setQty(i, n)} />
            <T v="captionStrong" style={{ minWidth: 70 }} alignEnd>{money(productSync(c.id).price * c.qty)}</T>
          </Row>
        ))}
        {cart.length ? <><Divider style={{ marginVertical: 6 }} /><KV k={t('common.subtotal')} v={money(tot.sub)} />{tot.disc ? <KV k={t('common.discount')} v={'− ' + money(tot.disc)} color={colors.success} /> : null}<KV k={t('common.total')} v={money(tot.total)} strong /></> : null}
      </Card>
      <Sheet visible={pick} onClose={() => setPick(false)} title={t('staff.pickMember')}>
        <Input icon="search-outline" placeholder={t('staff.searchPh')} value={q} onChangeText={setQ} />
        <ScrollView style={{ maxHeight: 380, marginTop: 10 }}>
          {members.filter((x) => !q || tr(x.name).toLowerCase().includes(q.toLowerCase()) || x.id.includes(q.toUpperCase())).map((x) => (
            <Pressable key={x.id} onPress={() => { setMemberId(x.id); setPick(false); }}>
              <Row gap={10} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}><T v="bodyStrong" style={{ flex: 1 }}>{tr(x.name)}</T><T v="micro" color={colors.textMuted}>{x.id} · {t(`tier.${x.tier}`)}</T></Row>
            </Pressable>
          ))}
        </ScrollView>
      </Sheet>
    </Screen>
  );
}

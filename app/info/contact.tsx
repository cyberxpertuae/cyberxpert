import React, { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, Input, Chip, useToast, IconName, Wrap, ltr } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { gym } from '../../src/services/catalogService';
import { wait } from '../../src/services/api';

/** P08 Contact us */
export default function Contact() {
  const { t } = useI18n();
  const toast = useToast();
  const [sub, setSub] = useState('membership');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const ch: { i: IconName; l: string; v: string; url: string; c: string }[] = [
    { i: 'logo-whatsapp', l: t('info.whatsapp'), v: gym.phone, url: `https://wa.me/${gym.whatsapp}`, c: '#25D366' },
    { i: 'call', l: t('common.call'), v: gym.phone, url: `tel:${gym.phone.replace(/\s/g, '')}`, c: colors.info },
    { i: 'mail', l: t('info.emailUs'), v: gym.email, url: `mailto:${gym.email}`, c: colors.danger },
    { i: 'logo-instagram', l: t('info.instagram'), v: gym.instagram, url: 'https://instagram.com/', c: '#C13584' },
  ];
  return (
    <Screen title={t('info.contactTitle')}>
      <T v="body" color={colors.textMuted}>{t('info.contactSub')}</T>
      <Wrap style={{ gap: 10 }}>
        {ch.map((c) => (
          <Pressable testID={`contact-${c.i}`} key={c.i} onPress={() => Linking.openURL(c.url)} style={{ width: '48%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, gap: 6 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.c + '22', alignItems: 'center', justifyContent: 'center' }}><Icon name={c.i} color={c.c} /></View>
            <T v="bodyStrong">{c.l}</T>
            <T v="micro" color={colors.textMuted} numberOfLines={1}>{ltr(c.v)}</T>
          </Pressable>
        ))}
      </Wrap>
      <Card style={{ gap: 12 }}>
        <T v="h3">{t('info.sendMsg')}</T>
        <Col gap={6}><T v="captionStrong" color={colors.textMuted}>{t('info.subject')}</T><Row gap={8} wrap>{['membership', 'shop', 'coaching', 'other'].map((s) => <Chip key={s} label={t(`info.sub_${s}`)} selected={sub === s} onPress={() => setSub(s)} />)}</Row></Col>
        <Input testID="contact-msg" label={t('info.message')} placeholder={t('info.msgPh')} multiline value={msg} onChangeText={(v) => { setMsg(v); setErr(''); }} error={err} />
        <Button testID="contact-send" title={t('info.send')} icon="send" loading={busy} onPress={async () => { if (msg.trim().length < 5) { setErr(t('common.required')); return; } setBusy(true); await wait(800); setBusy(false); setMsg(''); toast(t('info.sent')); }} />
      </Card>
    </Screen>
  );
}

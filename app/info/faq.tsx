import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Input, Button, EmptyState } from '../../src/components';
import { colors } from '../../src/theme';
import member from '../../src/data/mock/member.json';

/** P09 Help & FAQ */
export default function Faq() {
  const { t, tr } = useI18n();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<number | null>(0);
  const list = member.faqs.map((f, i) => ({ ...f, i })).filter((f) => !q || tr(f.q).toLowerCase().includes(q.toLowerCase()) || tr(f.a).toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen title={t('info.faqTitle')} footer={<Button title={t('info.stillNeed')} variant="dark" icon="chatbubble-ellipses-outline" onPress={() => router.push('/info/contact')} />}>
      <Input testID="faq-search" icon="search-outline" placeholder={t('info.faqSearch')} value={q} onChangeText={setQ} />
      {!list.length ? <EmptyState icon="help-circle-outline" title={t('search.empty', { q })} /> : list.map((f) => (
        <Card key={f.i} testID={`faq-${f.i}`}>
          <Pressable onPress={() => setOpen(open === f.i ? null : f.i)}>
            <Row gap={10}><T v="bodyStrong" style={{ flex: 1 }}>{tr(f.q)}</T><Icon name={open === f.i ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} /></Row>
          </Pressable>
          {open === f.i ? <T v="body" color={colors.textMuted} style={{ marginTop: 8 }}>{tr(f.a)}</T> : null}
        </Card>
      ))}
      <Col />
    </Screen>
  );
}

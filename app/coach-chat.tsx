import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '../src/i18n';
import { Header, T, Row, Icon, Img, EmptyState } from '../src/components';
import { colors, fonts, radius } from '../src/theme';
import { useApp } from '../src/store/app';
import { images } from '../src/data/images';
import { profileService } from '../src/services/profileService';
import { useFmt } from '../src/utils/format';
import { router } from 'expo-router';

/** P14 Coach chat */
export default function CoachChat() {
  const { t, tr, isRTL, align } = useI18n();
  const f = useFmt();
  const user = useApp((s) => s.user);
  const chat = useApp((s) => s.chat);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const ref = useRef<FlatList>(null);
  const send = async () => {
    if (!text.trim()) return;
    const m = text.trim(); setText(''); setTyping(true);
    await profileService.send(m); setTyping(false);
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <Header title={t('profile.chatTitle')} subtitle={typing ? t('profile.typing') : t('profile.chatSub')} right={<Img src={images['t-omar']} style={{ width: 40, height: 40 }} radius={20} />} />
      {!user ? <EmptyState icon="chatbubbles-outline" title={t('guest.title')} body={t('guest.body')} action={t('guest.create')} onAction={() => router.push('/auth/register')} /> : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList ref={ref} data={chat} keyExtractor={(m) => m.id} contentContainerStyle={{ padding: 16, gap: 10 }} onContentSizeChange={() => ref.current?.scrollToEnd({ animated: true })}
            renderItem={({ item: m }) => {
              const me = m.from === 'me';
              const right = me !== isRTL;
              return (
                <View style={{ alignSelf: right ? 'flex-end' : 'flex-start', maxWidth: '80%', backgroundColor: me ? colors.black : colors.surface, borderRadius: radius.lg, borderBottomRightRadius: right ? 4 : radius.lg, borderBottomLeftRadius: right ? radius.lg : 4, padding: 12 }}>
                  <T v="body" color={me ? colors.onDark : colors.text}>{typeof m.text === 'string' ? m.text : tr(m.text)}</T>
                  <T v="micro" color={me ? colors.onDarkMuted : colors.textSubtle} alignEnd>{f.clock(m.time)}</T>
                </View>
              );
            }} />
          <Row gap={10} style={{ padding: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }}>
            <TextInput testID="chat-input" value={text} onChangeText={setText} placeholder={t('profile.typeMsg')} placeholderTextColor={colors.textSubtle} onSubmitEditing={send} style={{ flex: 1, height: 46, borderRadius: radius.pill, backgroundColor: colors.surface2, paddingHorizontal: 16, fontFamily: fonts.medium, fontSize: 14, color: colors.text, textAlign: align, writingDirection: isRTL ? 'rtl' : 'ltr' }} />
            <Pressable testID="chat-send" onPress={send} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' }}><Icon name="send" size={20} /></Pressable>
          </Row>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

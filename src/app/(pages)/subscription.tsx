import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { subscriptionService, SubscriptionWithPlan } from '@/services/subscriptionService';
import { useTheme } from '@/contexts/ThemeProvider';
import { useRouter } from 'expo-router';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundDark};
  padding: 20px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const InfoText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  margin-bottom: 8px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  margin-top: 20px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
`;

export default function Subscription() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [sub, setSub] = useState<SubscriptionWithPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    subscriptionService
      .getUserSubscription(user.id)
      .then(setSub)
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar assinatura'))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleCancel = async () => {
    if (!sub) return;
    try {
      setCanceling(true);
      await subscriptionService.cancelSubscription(sub.id);
      Alert.alert('Sucesso', 'Assinatura cancelada');
      setSub(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível cancelar');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return (
    <>
      <Header title="Assinatura" showBackButton />
      <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
    </>
  );

  if (!sub) {
    return (
      <>
        <Header title="Assinatura" showBackButton />
        <Container>
          <Text style={{ color: colors.textPrimary }}>Você não possui assinatura ativa.</Text>
          <ActionButton onPress={() => router.replace('/pricing')}>
            <ButtonText>Ver planos</ButtonText>
          </ActionButton>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header title="Assinatura" showBackButton />
      <Container>
        <Title>Assinatura</Title>
        <InfoText>Plano: {sub.plans.name}</InfoText>
        <InfoText>Status: {sub.status}</InfoText>
        <InfoText>
          Início: {new Date(sub.starts_at).toLocaleDateString('pt-BR')}
        </InfoText>
        <InfoText>
          {sub.ends_at
            ? `Termina: ${new Date(sub.ends_at).toLocaleDateString('pt-BR')}`
            : 'Sem data de término'}
        </InfoText>
        <ActionButton disabled={canceling} onPress={handleCancel}>
          <ButtonText>{canceling ? 'Cancelando...' : 'Cancelar assinatura'}</ButtonText>
        </ActionButton>
        <ActionButton onPress={() => router.push('/pricing?hideFree=true')}>
          <ButtonText>Upgrade de conta</ButtonText>
        </ActionButton>
      </Container>
    </>
  );
}

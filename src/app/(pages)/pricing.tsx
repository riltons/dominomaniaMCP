import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService, Plan } from '@/services/subscriptionService';
import { useTheme } from '@/contexts/ThemeProvider';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundDark};
  padding: 20px;
`;

const PlanCard = styled.View`
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: bold;
`;

const PriceText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  margin-vertical: 8px;
`;

const FeatureText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-vertical: 2px;
`;

const SubscribeButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  margin-top: 12px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const ButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
`;

export default function Pricing() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    subscriptionService
      .getPlans()
      .then(setPlans)
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar planos'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (slug: string) => {
    // Se for plano gratuito, navegar para cadastro e setar plano free
    if (slug === 'free') {
      router.replace(`/register?plan=${slug}`);
      return;
    }
    if (!user) {
      router.replace('/login');
      return;
    }
    try {
      setSubmitting(slug);
      await subscriptionService.startUserTrial(user.id, slug);
      router.replace('/subscription');
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar trial');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />;

  return (
    <Container>
      {plans.map(plan => (
        <PlanCard key={plan.id}>
          <Title>{plan.name}</Title>
          <PriceText>
            {(plan.price_cents / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: plan.currency,
            })}{' '}/ {plan.interval === 'month' ? 'mês' : 'ano'}
          </PriceText>
          {plan.features.map((f, i) => (
            <FeatureText key={i}>• {f}</FeatureText>
          ))}
          <SubscribeButton disabled={submitting !== null} onPress={() => handleSubscribe(plan.slug)}>
            {submitting === plan.slug ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ButtonText>{plan.slug === 'free' ? 'Cadastre-se' : 'Iniciar trial'}</ButtonText>
            )}
          </SubscribeButton>
        </PlanCard>
      ))}
    </Container>
  );
}

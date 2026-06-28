import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Dimensions } from 'react-native'
import { lightTheme, darkTheme } from '../services/theme'

const SLIDES = [
  {
    title: 'Bienvenue sur Filahi',
    subtitle: 'La plateforme qui connecte agriculteurs, chauffeurs et acheteurs en Tunisie',
    icon: '🌾',
  },
  {
    title: 'Gagnez de l\'argent',
    subtitle: 'Transportez des produits frais de la ferme aux hubs et aux acheteurs. Paiement rapide et transparent.',
    icon: '💰',
  },
  {
    title: 'Suivi en temps réel',
    subtitle: 'GPS actif même écran verrouillé. Codes OTP pour chaque livraison. Votre historique et gains visibles à tout moment.',
    icon: '📍',
  },
  {
    title: 'Prêt à commencer ?',
    subtitle: 'Inscrivez-vous avec votre CIN et carte grise. Commencez à transporter dès aujourd\'hui.',
    icon: '🚀',
  },
]

const { width } = Dimensions.get('window')

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [slideIndex, setSlideIndex] = useState(0)
  const isDark = useColorScheme() === 'dark'
  const t = isDark ? darkTheme : lightTheme

  const slide = SLIDES[slideIndex]
  const isLast = slideIndex === SLIDES.length - 1

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={[styles.title, { color: t.text }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>{slide.subtitle}</Text>
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: t.border },
              i === slideIndex && { backgroundColor: t.accent, width: 24 },
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {!isLast && (
          <TouchableOpacity style={[styles.skipBtn]} onPress={onComplete}>
            <Text style={[styles.skipText, { color: t.textSecondary }]}>Passer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: t.accent }]}
          onPress={() => (isLast ? onComplete() : setSlideIndex(slideIndex + 1))}
        >
          <Text style={styles.nextText}>{isLast ? 'Commencer' : 'Suivant'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  icon: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 12, maxWidth: width - 64 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, maxWidth: width - 64 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 48 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 8 },
  skipText: { fontSize: 15 },
  nextBtn: { borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})

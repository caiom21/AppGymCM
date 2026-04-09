import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Planos\nPremium', icon: '📋' },
  { id: '2', name: 'Suplem\nentos', icon: '💊' },
  { id: '3', name: 'Acess\nórios', icon: '🏋️' },
  { id: '4', name: 'Coach\nOnline', icon: '👨‍🏫' },
  { id: '5', name: 'Cursos', icon: '📚' },
];

const TRENDING = [
  { id: 'p1', name: 'PPL Avançado — 12 Semanas', price: 'R$ 29,90', rating: 4.8, reviews: 312, sales: '1.2k', author: 'Coach Ricardo Silva' },
  { id: 'p2', name: 'Whey Protein ISO', price: 'R$ 129,90', rating: 4.6, reviews: 89, sales: '890', author: 'GymOS Nutrition' },
  { id: 'p3', name: 'Elástico Pro Set', price: 'R$ 35,00', rating: 4.5, reviews: 87, sales: '540', author: 'GymOS Gear' },
  { id: 'p4', name: 'Creatina 300g', price: 'R$ 89,90', rating: 4.7, reviews: 421, sales: '2.1k', author: 'GymOS Nutrition' },
];

// ── Product Detail Bottom Sheet ──
function ProductSheet({ product, onClose }: { product: typeof TRENDING[0]; onClose: () => void }) {
  const [buying, setBuying] = useState(false);

  const handleBuy = () => {
    setBuying(true);
    setTimeout(() => { setBuying(false); onClose(); }, 2000);
  };

  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));

  return (
    <View className="absolute inset-0 z-50">
      <Pressable onPress={onClose} className="absolute inset-0 bg-black/60" />
      <View className="absolute bottom-0 left-0 right-0 bg-bg border-t border-borderColor rounded-t-3xl" style={{ maxHeight: '80%' }}>
        <View className="items-center py-3">
          <View className="w-10 h-1 bg-borderColor rounded-full" />
        </View>
        <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
          {/* Photo carousel placeholder */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-1">
            {[1, 2, 3].map(i => (
              <View key={i} className="w-56 h-40 bg-surface border border-borderColor rounded-xl mx-1 items-center justify-center">
                <Text className="text-textFaint font-mono text-[10px]">Foto {i}</Text>
              </View>
            ))}
          </ScrollView>

          <Text className="text-textPrimary font-mono-bold text-lg uppercase mb-0.5">{product.name}</Text>
          <Text className="text-textFaint font-mono text-[10px] mb-2">por {product.author}</Text>

          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-primary font-mono text-[10px]">{stars}</Text>
            <Text className="text-textFaint font-mono text-[9px]">{product.rating} · {product.reviews} avaliações · {product.sales} vendas</Text>
          </View>

          <Text className="text-primary font-mono-bold text-2xl mb-4">{product.price}</Text>

          <View className="h-[1px] bg-borderColor/30 mb-3" />

          <Text className="text-textSecondary font-mono text-xs leading-relaxed mb-4">
            Produto de alta qualidade selecionado pela equipe GymOS. Entrega rápida e garantia de satisfação.
            Ideal para quem busca resultados consistentes.
          </Text>

          <View className="h-[1px] bg-borderColor/30 mb-3" />

          {/* Reviews */}
          <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-primary font-mono text-[10px]">⭐⭐⭐⭐⭐</Text>
              <Text className="text-textPrimary font-mono text-[10px]">"Melhor plano que já usei"</Text>
            </View>
            <Text className="text-textFaint font-mono text-[9px] ml-7">— @marcos_fit · há 3 dias</Text>

            <View className="flex-row items-center gap-2 mb-2 mt-3">
              <Text className="text-primary font-mono text-[10px]">⭐⭐⭐⭐☆</Text>
              <Text className="text-textPrimary font-mono text-[10px]">"Muito bom, mas puxado"</Text>
            </View>
            <Text className="text-textFaint font-mono text-[9px] ml-7">— @ana_treina · há 1 semana</Text>

            <Pressable className="mt-2">
              <Text className="text-primary font-mono text-[9px]">Ver todas as avaliações →</Text>
            </Pressable>
          </View>

          <View className="h-24" />
        </ScrollView>

        {/* Fixed CTA */}
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-10 pt-3 bg-bg border-t border-borderColor">
          <Pressable
            onPress={handleBuy}
            disabled={buying}
            className={`h-14 rounded-xl items-center justify-center flex-row ${buying ? 'bg-primary/50' : 'bg-primary'} active:bg-primary/80`}
          >
            {buying ? (
              <Text className="text-bg font-mono-bold text-xs uppercase">Processando...</Text>
            ) : (
              <>
                <FontAwesome name="shopping-cart" size={14} color="#0A0A0A" style={{ marginRight: 8 }} />
                <Text className="text-bg font-mono-bold text-xs uppercase">
                  🛒 Comprar — {product.price}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function StoreScreen() {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<typeof TRENDING[0] | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Header ── */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-textPrimary font-mono-bold text-2xl uppercase tracking-tighter">
            Loja <Text className="text-primary">GymOS</Text>
          </Text>
          <Pressable className="w-9 h-9 items-center justify-center border border-borderColor rounded-full relative">
            <FontAwesome name="shopping-cart" size={14} color="#888" />
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full items-center justify-center">
              <Text className="text-bg font-mono-bold text-[7px]">2</Text>
            </View>
          </Pressable>
        </View>

        {/* ── Search ── */}
        <View className="bg-surface border border-borderColor rounded-xl flex-row items-center px-3 mb-5">
          <FontAwesome name="search" size={13} color="#666" />
          <TextInput
            className="flex-1 h-11 ml-3 font-mono text-xs text-textPrimary"
            placeholder="Buscar produtos, planos..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={setSearch}
            cursorColor="#FBFF00"
          />
        </View>

        {/* ── Banner Carousel ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 -mx-1">
          {[{ title: 'Black Friday', subtitle: '30% OFF em todos os planos' }, { title: 'Novidades', subtitle: 'Coach AI chegando' }, { title: 'Frete Grátis', subtitle: 'Acima de R$99' }].map((b, i) => (
            <View key={i} className="w-72 h-32 bg-surface border border-borderColor rounded-2xl mx-1.5 items-center justify-center px-4">
              <Text className="text-primary font-mono-bold text-sm uppercase">{b.title}</Text>
              <Text className="text-textFaint font-mono text-[10px] text-center mt-1">{b.subtitle}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Categories ── */}
        <Text className="text-textFaint font-mono-bold text-[9px] uppercase tracking-widest mb-3">Categorias</Text>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {CATEGORIES.map((cat) => (
            <Pressable key={cat.id} className="bg-surface border border-borderColor px-4 py-3 rounded-xl items-center active:bg-accentDim" style={{ width: (width - 40 - 16) / 3 }}>
              <Text className="text-lg mb-1">{cat.icon}</Text>
              <Text className="text-textPrimary font-mono text-[8px] uppercase text-center">{cat.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Best Sellers ── */}
        <Text className="text-textFaint font-mono-bold text-[9px] uppercase tracking-widest mb-3">🔥 Mais Vendidos</Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {TRENDING.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => setSelectedProduct(product)}
              className="bg-surface border border-borderColor rounded-2xl overflow-hidden active:bg-accentDim"
              style={{ width: (width - 40 - 12) / 2 }}
            >
              <View className="h-28 bg-accentDim items-center justify-center">
                <FontAwesome name="image" size={24} color="#333" />
              </View>
              <View className="p-3">
                <Text className="text-textPrimary font-mono-bold text-[10px] uppercase mb-1" numberOfLines={2}>{product.name}</Text>
                <View className="flex-row items-center gap-1 mb-1">
                  <Text className="text-primary font-mono text-[8px]">⭐ {product.rating}</Text>
                  <Text className="text-textFaint font-mono text-[8px]">({product.reviews})</Text>
                </View>
                <Text className="text-primary font-mono-bold text-sm">{product.price}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── New Arrivals ── */}
        <Text className="text-textFaint font-mono-bold text-[9px] uppercase tracking-widest mb-3">🆕 Novidades</Text>
        <View className="bg-surface border border-borderColor rounded-2xl p-4 items-center">
          <Text className="text-textFaint font-mono text-[10px]">Em breve...</Text>
        </View>
      </ScrollView>

      {selectedProduct && (
        <ProductSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </SafeAreaView>
  );
}

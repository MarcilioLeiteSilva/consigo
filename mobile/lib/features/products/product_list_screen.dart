import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';
import 'product_form_screen.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final ApiClient _api = ApiClient();
  List<Product> _allProducts = [];
  List<Product> _filteredProducts = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.dio.get('/products');
      final List<dynamic> data = response.data['data'];
      setState(() {
        _allProducts = data.map((json) => Product.fromJson(json)).toList();
        _filteredProducts = _allProducts;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar produtos: $e');
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erro ao carregar produtos')),
        );
      }
    }
  }

  void _filterProducts(String query) {
    setState(() {
      _filteredProducts = _allProducts
          .where((p) => p.name.toLowerCase().contains(query.toLowerCase()) || 
                          (p.sku?.toLowerCase().contains(query.toLowerCase()) ?? false))
          .toList();
    });
  }

  Future<void> _deleteProduct(Product product) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Excluir Produto', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: Text('Deseja realmente excluir "${product.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancelar', style: GoogleFonts.inter(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Excluir', style: GoogleFonts.inter(color: Colors.redAccent, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _api.dio.delete('/products/${product.id}');
        _loadProducts();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Erro ao excluir produto. Verifique se há lotes vinculados.')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Catálogo de Produtos',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
        ),
        actions: [
          IconButton(
            onPressed: _loadProducts,
            icon: const Icon(Icons.refresh, color: Color(0xFF64748B)),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 15),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: TextField(
                controller: _searchController,
                onChanged: _filterProducts,
                decoration: const InputDecoration(
                  hintText: 'Buscar por nome ou SKU...',
                  border: InputBorder.none,
                  icon: Icon(Icons.search, size: 20, color: Color(0xFF64748B)),
                ),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredProducts.isEmpty
                    ? Center(child: Text('Nenhum produto encontrado', style: GoogleFonts.inter(color: Colors.grey)))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: _filteredProducts.length,
                        itemBuilder: (context, index) {
                          final product = _filteredProducts[index];
                          return FadeInUp(
                            duration: Duration(milliseconds: 300 + (index * 50)),
                            child: _buildProductCard(product),
                          );
                        },
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ProductFormScreen()),
          );
          if (result == true) _loadProducts();
        },
        backgroundColor: const Color(0xFF6366F1),
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text('Novo Produto', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white)),
      ),
    );
  }

  Widget _buildProductCard(Product product) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(15),
              image: product.imageUrl != null && product.imageUrl!.isNotEmpty
                  ? DecorationImage(image: NetworkImage(product.imageUrl!), fit: BoxFit.cover)
                  : null,
            ),
            child: product.imageUrl == null || product.imageUrl!.isEmpty
                ? const Icon(Icons.inventory_2_outlined, color: Color(0xFF6366F1))
                : null,
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                ),
                Text(
                  'SKU: ${product.sku ?? "N/A"} • ${product.category?.name ?? "Sem categoria"}',
                  style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                ),
                const SizedBox(height: 5),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Estoque: ${product.totalStock}',
                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF6366F1)),
                  ),
                ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            onSelected: (val) {
              if (val == 'edit') {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => ProductFormScreen(product: product)),
                ).then((res) => {if (res == true) _loadProducts()});
              } else if (val == 'delete') {
                _deleteProduct(product);
              }
            },
            itemBuilder: (ctx) => [
              const PopupMenuItem(value: 'edit', child: Text('Editar')),
              const PopupMenuItem(value: 'delete', child: Text('Excluir', style: TextStyle(color: Colors.redAccent))),
            ],
          ),
        ],
      ),
    );
  }
}

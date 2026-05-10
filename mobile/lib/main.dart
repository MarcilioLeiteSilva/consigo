import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'features/splash/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ConsigoApp());
}

class ConsigoApp extends StatelessWidget {
  const ConsigoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Consigo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        textTheme: GoogleFonts.interTextTheme(),
      ),
      home: const SplashScreen(),
    );
  }
}

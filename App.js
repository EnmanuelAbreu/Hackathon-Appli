// App.js
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Switch,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import * as Font from 'expo-font';

// ─────────────────────────────────────────────
// 1. CARGA DE LA FUENTE "MadimiOne-Regular"
// ─────────────────────────────────────────────
const fetchFonts = () => {
  return Font.loadAsync({
    'MadimiOne-Regular': require('./assets/fonts/MadimiOne-Regular.ttf'),
  });
};

const menuWidth = 250;

// ─────────────────────────────────────────────
// 2. Componente TopBar (barra superior con opción de menú)
// ─────────────────────────────────────────────
const TopBar = ({ darkMode, toggleMenu }) => {
  return (
    <View style={[topBarStyles.container, { backgroundColor: darkMode ? "#2A2938" : "#CCCCCC" }]}>
      <TouchableOpacity onPress={toggleMenu} style={topBarStyles.menuButton}>
        <Text style={[topBarStyles.menuButtonText, { color: darkMode ? "#fff" : "#000" }]}>
          ☰
        </Text>
      </TouchableOpacity>
      <Text
        style={[
          topBarStyles.title,
          { color: darkMode ? "#fff" : "#000", flex: 1, textAlign: 'left', marginLeft: 10 },
        ]}
      >
        Statistics Viewer
      </Text>
      <View style={topBarStyles.avatarContainer}>
        <Text style={topBarStyles.avatarText}>AV</Text>
      </View>
    </View>
  );
};

const topBarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuButton: {
    padding: 5,
  },
  menuButtonText: {
    fontSize: 24,
    fontFamily: 'MadimiOne-Regular',
  },
  title: {
    fontSize: 20,
    fontFamily: 'MadimiOne-Regular',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FECF70",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontFamily: 'MadimiOne-Regular',
  },
});

// ─────────────────────────────────────────────
// 3. Componente MonthSelector (selector desplegable de mes)
// ─────────────────────────────────────────────
const MonthSelector = ({ selectedMonthIndex, months, onChangeMonth, darkMode }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={dashboardStyles.monthSelectorContainer}>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={dashboardStyles.monthSelectorButton}
      >
        <Text style={[dashboardStyles.monthSelectorText, { color: darkMode ? '#fff' : '#000' }]}>
          {months[selectedMonthIndex]}
        </Text>
      </TouchableOpacity>
      {open && (
        <View
          style={[
            dashboardStyles.monthDropdown,
            {
              backgroundColor: darkMode ? 'rgba(42,41,56,0.9)' : 'rgba(255,255,255,0.9)',
              right: 10,
            },
          ]}
        >
          {months.map((month, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setOpen(false);
                onChangeMonth(index);
              }}
            >
              <Text style={[dashboardStyles.monthDropdownText, { color: darkMode ? '#fff' : '#000' }]}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────
// 4. Componente Dashboard (estadísticas y gráfico interactivo)
// ─────────────────────────────────────────────
const Dashboard = ({ darkMode, dashboardData, onChangeMonth, selectedMonthIndex, months }) => {
  const chartHeight = 200;
  const maxUsage = 18;
  const { usageData, headerText, subtitleText } = dashboardData;
  // Colores para cada barra (fijos)
  const barColors = [
    "#FF3B30",
    "#FECF70",
    "#9DF075",
    "#FF9F47",
    "#C2EA78",
    "#FF9F47",
    "#FECF70",
  ];

  // Animación de fade para la transición al cambiar de mes
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [headerText]);

  // Estado para controlar qué barra se ha seleccionado para ver el tooltip
  const [selectedBarIndex, setSelectedBarIndex] = useState(null);

  const formatTime = (value) => {
    const hrs = Math.floor(value);
    const mins = Math.round((value - hrs) * 60);
    return `${hrs}H ${mins}min`;
  };

  // Días completos de la semana (para tooltip) y abreviados (para debajo de cada barra)
  const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  return (
    <View style={dashboardStyles.container}>
      <View style={dashboardStyles.infoContainer}>
        <View style={dashboardStyles.headerRow}>
          <Text style={[dashboardStyles.headerText, { color: darkMode ? '#fff' : '#000' }]}>
            {headerText}
          </Text>
          <MonthSelector
            selectedMonthIndex={selectedMonthIndex}
            months={months}
            onChangeMonth={onChangeMonth}
            darkMode={darkMode}
          />
        </View>
        <Text style={[dashboardStyles.subtitleText, { color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
          {subtitleText}
        </Text>
      </View>

      <Animated.View style={[dashboardStyles.chartRow, { opacity: fadeAnim }]}>
        <View style={dashboardStyles.yAxisContainer}>
          {[18, 12, 6].map((val, index) => {
            const topPos = chartHeight - (val / maxUsage) * chartHeight;
            return (
              <Text
                key={index}
                style={[
                  dashboardStyles.yAxisLabel,
                  { top: topPos - 8, color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' },
                ]}
              >
                {val}
              </Text>
            );
          })}
        </View>
        <View
          style={[
            dashboardStyles.chartContainer,
            { height: chartHeight, borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' },
          ]}
        >
          {[12, 6].map((val, index) => {
            const topPos = chartHeight - (val / maxUsage) * chartHeight;
            return <View key={index} style={[dashboardStyles.gridLine, { top: topPos }]} />;
          })}
          <View style={dashboardStyles.barsContainer}>
            {usageData.map((usage, index) => {
              const barHeight = (usage / maxUsage) * chartHeight;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() =>
                    setSelectedBarIndex(index === selectedBarIndex ? null : index)
                  }
                >
                  <View style={{ alignItems: 'center' }}>
                    {selectedBarIndex === index && (
                      <View style={dashboardStyles.tooltip}>
                        <Text style={dashboardStyles.tooltipText}>
                          {weekDays[index]}: {formatTime(usage)}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[dashboardStyles.bar, { height: barHeight, backgroundColor: barColors[index] }]}
                    />
                    {/* Etiqueta abreviada del día debajo de la barra */}
                    <Text style={[dashboardStyles.xAxisLabel, { color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }]}>
                      {weekDays[index].slice(0, 3)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>
      <View style={dashboardStyles.xAxisContainer}>
        {/* Se puede dejar vacío o ajustar según el diseño deseado */}
      </View>
    </View>
  );
};

const dashboardStyles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
  },
  infoContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerText: {
    fontSize: 35,
    // Se elimina fontWeight para asegurar que se aplique solo la tipografía
    fontFamily: 'MadimiOne-Regular',
  },
  subtitleText: {
    fontSize: 15,
    marginTop: 5,
    fontFamily: 'MadimiOne-Regular',
  },
  monthSelectorContainer: {
    position: 'relative',
  },
  monthSelectorButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  monthSelectorText: {
    fontSize: 16,
    fontFamily: 'MadimiOne-Regular',
  },
  monthDropdown: {
    position: 'absolute',
    top: 35,
    // Se quita right:0 para usar el inline (se ajusta a 10)
    borderRadius: 5,
    padding: 8,
    zIndex: 10,
  },
  monthDropdownText: {
    fontSize: 16,
    paddingVertical: 4,
    fontFamily: 'MadimiOne-Regular',
  },
  chartRow: {
    flexDirection: 'row',
  },
  yAxisContainer: {
    width: 30,
    position: 'relative',
  },
  yAxisLabel: {
    position: 'absolute',
    left: 0,
    fontSize: 12,
    fontFamily: 'MadimiOne-Regular',
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
    marginLeft: 5,
    borderLeftWidth: 1,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    paddingHorizontal: 5,
  },
  bar: {
    width: 15,
    borderRadius: 5,
  },
  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'MadimiOne-Regular',
  },
  xAxisContainer: {
    flexDirection: 'row',
    marginTop: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  xAxisLabel: {
    fontSize: 14,
    fontFamily: 'MadimiOne-Regular',
  },
});

// ─────────────────────────────────────────────
// 5. Componente ApplicationsList (lista de apps actualizada según el mes)
// ─────────────────────────────────────────────
const ApplicationsList = ({ darkMode, appsData }) => {
  // Logos de las apps: las claves se actualizan para que coincidan con los nombres generados
  const logos = {
    Netflix: require('./assets/Logo-Icons/Netflix.png'),
    "HBO Max": require('./assets/Logo-Icons/HBOMax.jpg'),
    "Disney +": require('./assets/Logo-Icons/disney.jpg'),
    Spotify: require('./assets/Logo-Icons/Spotify.png'),
    "Prime Video": require('./assets/Logo-Icons/PrimeVideo.png'),
  };

  // Se ordena de mayor a menor según el valor numérico (parseFloat ignora el "%" al final)
  const sortedApps = [...appsData].sort(
    (a, b) => parseFloat(b.usage) - parseFloat(a.usage)
  );

  return (
    <View style={appsListStyles.container}>
      <Text style={[appsListStyles.title, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
        Applications
      </Text>
      {sortedApps.map((app, index) => (
        <View key={index} style={appsListStyles.appRow}>
          <View style={appsListStyles.appInfo}>
            <Image source={logos[app.name]} style={appsListStyles.appIcon} />
            <Text style={[appsListStyles.appName, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
              {app.name}
            </Text>
          </View>
          <Text style={[appsListStyles.appUsage, { color: '#FECF70' }]}>
            {app.usage}
          </Text>
        </View>
      ))}
    </View>
  );
};

const appsListStyles = StyleSheet.create({
  container: { 
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: { 
    fontSize: 28,
    // Se elimina fontWeight para usar solo la tipografía
    marginBottom: 10,
    fontFamily: 'MadimiOne-Regular',
    textAlign: 'left',
  },
  appRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 2,
  },
  appName: { 
    fontSize: 20,
    fontFamily: 'MadimiOne-Regular',
  },
  appUsage: { 
    fontSize: 20,
    fontFamily: 'MadimiOne-Regular',
    textAlign: 'right',
  },
});

// ─────────────────────────────────────────────
// 6. Componente principal de la App
// ─────────────────────────────────────────────
const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(-menuWidth)).current;

  // Array de meses para el selector
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];

  // Funciones para generar datos nuevos según el mes
  const generateDashboardData = () => {
    const maxUsage = 18;
    const usageData = Array.from({ length: 7 }, () =>
      parseFloat((Math.random() * maxUsage).toFixed(1))
    );
    const total = usageData.reduce((acc, cur) => acc + cur, 0);
    const hours = Math.floor(total);
    const minutes = Math.round((total - hours) * 60);
    return { 
      usageData, 
      headerText: `${hours}H ${minutes}min`, 
      subtitleText: "Average screen time in the month" 
    };
  };

  const generateAppsData = () => {
    const apps = [
      { name: 'Netflix', usage: `${Math.floor(Math.random() * 30) + 1}%` },
      { name: 'HBO Max', usage: `${Math.floor(Math.random() * 30) + 1}%` },
      { name: 'Disney +', usage: `${Math.floor(Math.random() * 30) + 1}%` },
      { name: 'Spotify', usage: `${Math.floor(Math.random() * 30) + 1}%` },
      { name: 'Prime Video', usage: `${Math.floor(Math.random() * 30) + 1}%` },
    ];
    return apps;
  };

  // Estados globales para el mes seleccionado y sus datos
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [dashboardData, setDashboardData] = useState(generateDashboardData());
  const [appsData, setAppsData] = useState(generateAppsData());

  const handleChangeMonth = (newIndex) => {
    setSelectedMonthIndex(newIndex);
    setDashboardData(generateDashboardData());
    setAppsData(generateAppsData());
  };

  if (!fontsLoaded) {
    fetchFonts().then(() => setFontsLoaded(true));
    return null;
  }

  const toggleMenu = () => {
    if (!menuVisible) {
      setMenuVisible(true);
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuAnim, {
        toValue: -menuWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    }
  };

  const backgroundColor = darkMode ? "#1B1A23" : "#F5F5F5";
  const menuBackground = darkMode ? "#2A2938" : "#fff";
  const menuTextColor = darkMode ? "#fff" : "#000";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />
      <TopBar darkMode={darkMode} toggleMenu={toggleMenu} />
      <ScrollView contentContainerStyle={styles.content}>
        <Dashboard
          darkMode={darkMode}
          dashboardData={dashboardData}
          onChangeMonth={handleChangeMonth}
          selectedMonthIndex={selectedMonthIndex}
          months={months}
        />
        <ApplicationsList darkMode={darkMode} appsData={appsData} />
      </ScrollView>
      {menuVisible && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} activeOpacity={1}>
          <Animated.View
            style={[
              styles.sideMenu,
              { transform: [{ translateX: menuAnim }], backgroundColor: menuBackground },
            ]}
          >
            <Text style={[styles.menuTitle, { color: menuTextColor }]}>Menú</Text>
            <View style={styles.menuItem}>
              <Text style={[styles.menuText, { color: menuTextColor }]}>Tema Oscuro</Text>
              <Switch value={darkMode} onValueChange={(value) => setDarkMode(value)} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
    paddingBottom: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: menuWidth,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  menuTitle: {
    fontSize: 20,
    fontFamily: 'MadimiOne-Regular',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'MadimiOne-Regular',
  },
});

export default App;

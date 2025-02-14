// App.js
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Switch,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import * as Font from 'expo-font';

// ─────────────────────────────────────────────
// Constantes de configuración
// ─────────────────────────────────────────────
const OPENAI_API_KEY = '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';
const SIMULATE_API = true; // Cambia a false para producción

// URLs de cancelación para cada servicio (excepto PressReader)
const cancellationURLs = {
  Netflix: "https://www.netflix.com/cancel",
  "HBO Max": "https://www.hbomax.com/cancel",
  "Disney +": "https://www.disneyplus.com/cancel",
  Spotify: "https://www.spotify.com/cancel",
  "Prime Video": "https://www.primevideo.com/cancel",
};

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
// 2. Componente TopBar (barra superior con menú, título y avatar)
// ─────────────────────────────────────────────
const TopBar = ({ darkMode, toggleMenu, onAvatarPress }) => {
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
          { color: darkMode ? "#fff" : "#000", flex: 1, textAlign: 'center', marginLeft: 10 },
        ]}
      >
        ServTrack 
      </Text>
      <TouchableOpacity style={topBarStyles.avatarContainer} onPress={onAvatarPress}>
        <Image
          source={require('./assets/Logo-Icons/ServTrack.png')}
          style={topBarStyles.avatarImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
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
    overflow: 'hidden',
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 40,
    height: 40,
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
// 4. Componente Dashboard (vista general: promedio y gráfico)
// ─────────────────────────────────────────────
const Dashboard = ({ darkMode, dashboardData, onChangeMonth, selectedMonthIndex, months }) => {
  const chartHeight = 200;
  const maxUsage = 18;
  const { usageData, headerText, subtitleText } = dashboardData;
  const barColors = [
    "#FF3B30",
    "#FECF70",
    "#9DF075",
    "#FF9F47",
    "#C2EA78",
    "#FF9F47",
    "#FECF70",
  ];
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
  const [selectedBarIndex, setSelectedBarIndex] = useState(null);
  const formatTime = (value) => {
    const hrs = Math.floor(value);
    const mins = Math.round((value - hrs) * 60);
    return `${hrs}H ${mins}min`;
  };
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
  xAxisLabel: {
    fontSize: 14,
    fontFamily: 'MadimiOne-Regular',
  },
  xAxisContainer: {
    flexDirection: 'row',
    marginTop: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
});

// ─────────────────────────────────────────────
// 5. Componente ApplicationsList (lista de apps ordenada)
// ─────────────────────────────────────────────
const ApplicationsList = ({ darkMode, appsData, onSelectApp }) => {
  const logos = {
    Netflix: require('./assets/Logo-Icons/Netflix.png'),
    "HBO Max": require('./assets/Logo-Icons/HBOMax.jpg'),
    "Disney +": require('./assets/Logo-Icons/disney.jpg'),
    Spotify: require('./assets/Logo-Icons/Spotify.png'),
    "Prime Video": require('./assets/Logo-Icons/PrimeVideo.png'),
    PressReader: require('./assets/Logo-Icons/PressReader.png'),
  };
  const sortedApps = appsData
    .slice()
    .sort((a, b) => parseFloat(b.usage.replace('%', '')) - parseFloat(a.usage.replace('%', '')));
  return (
    <View style={appsListStyles.container}>
      <Text style={[appsListStyles.title, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
        Applications
      </Text>
      {sortedApps.map((app, index) => {
        const usageValue = parseFloat(app.usage.replace('%', ''));
        let nameColor = darkMode ? '#FFFFFF' : '#000000';
        if (usageValue > 25) {
          nameColor = "#FFA500";
        } else if (usageValue < 10) {
          nameColor = "#FF0000";
        }
        return (
          <TouchableOpacity key={index} onPress={() => onSelectApp(app)}>
            <View style={appsListStyles.appRow}>
              <View style={appsListStyles.appInfo}>
                <Image source={logos[app.name]} style={appsListStyles.appIcon} />
                <Text style={[appsListStyles.appName, { color: nameColor }]}>
                  {app.name}
                </Text>
              </View>
              <Text style={[appsListStyles.appUsage, { color: '#FECF70' }]}>
                {app.usage}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
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
// 6. Función para generar datos del dashboard general
// ─────────────────────────────────────────────
const generateDashboardData = () => {
  const maxUsage = 18;
  const usageData = Array.from({ length: 7 }, () =>
    parseFloat((Math.random() * maxUsage).toFixed(1))
  );
  const total = usageData.reduce((acc, cur) => acc + cur, 0);
  const hours = Math.floor(total);
  const minutes = Math.round((total - hours) * 60);
  const totalMinutes = hours * 60 + minutes;
  return { 
    usageData, 
    headerText: `${hours}H ${minutes}min`, 
    subtitleText: "Average screen time in the month",
    totalMinutes
  };
};

// ─────────────────────────────────────────────
// 7. Función para generar datos del dashboard detallado para una app
// Se utiliza el porcentaje de uso para distribuir el total general
// ─────────────────────────────────────────────
const generateAppDetailData = (appUsagePercentage, overallTotalMinutes, monthIndex = 0) => {
  // Se elimina el factor extra para que el total específico sea:
  // overallTotalMinutes * (appUsagePercentage / 100)
  const appTotalMinutes = overallTotalMinutes * (appUsagePercentage / 100);
  let randoms = Array.from({ length: 7 }, () => Math.random());
  const sumRandoms = randoms.reduce((acc, cur) => acc + cur, 0);
  const usageData = randoms.map(r => parseFloat(((r / sumRandoms) * (appTotalMinutes / 60)).toFixed(1)));
  const appHours = Math.floor(appTotalMinutes / 60);
  const appMins = Math.round(appTotalMinutes - appHours * 60);
  const headerText = `${appHours}H ${appMins}min`;
  const subtitleText = "App-specific usage in the month";
  return { usageData, headerText, subtitleText };
};

// ─────────────────────────────────────────────
// 8. Componente DetailDashboard (dashboard en la vista de detalle)
// ─────────────────────────────────────────────
const DetailDashboard = ({ darkMode, detailData, selectedMonth, months, onChangeMonth }) => {
  const chartHeight = 200;
  const maxUsage = 18;
  const { usageData, headerText, subtitleText } = detailData;
  const barColors = [
    "#FF3B30",
    "#FECF70",
    "#9DF075",
    "#FF9F47",
    "#C2EA78",
    "#FF9F47",
    "#FECF70",
  ];
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  }, [headerText]);
  const [selectedBarIndex, setSelectedBarIndex] = useState(null);
  const formatTime = (value) => {
    const hrs = Math.floor(value);
    const mins = Math.round((value - hrs) * 60);
    return `${hrs}H ${mins}min`;
  };
  const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return (
    <View style={detailDashboardStyles.container}>
      <View style={detailDashboardStyles.infoContainer}>
        <View style={detailDashboardStyles.headerRow}>
          <Text style={[detailDashboardStyles.headerText, { color: darkMode ? '#fff' : '#000' }]}>
            {headerText}
          </Text>
          <MonthSelector
            selectedMonthIndex={selectedMonth}
            months={months}
            onChangeMonth={onChangeMonth}
            darkMode={darkMode}
          />
        </View>
        <Text style={[detailDashboardStyles.subtitleText, { color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
          {subtitleText}
        </Text>
      </View>
      <Animated.View style={[detailDashboardStyles.chartRow, { opacity: fadeAnim }]}>
        <View style={detailDashboardStyles.yAxisContainer}>
          {[18, 12, 6].map((val, index) => {
            const topPos = chartHeight - (val / maxUsage) * chartHeight;
            return (
              <Text key={index} style={[detailDashboardStyles.yAxisLabel, { top: topPos - 8, color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
                {val}
              </Text>
            );
          })}
        </View>
        <View style={[detailDashboardStyles.chartContainer, { height: chartHeight, borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }]}>
          {[12, 6].map((val, index) => {
            const topPos = chartHeight - (val / maxUsage) * chartHeight;
            return <View key={index} style={[detailDashboardStyles.gridLine, { top: topPos }]} />;
          })}
          <View style={detailDashboardStyles.barsContainer}>
            {usageData.map((usage, index) => {
              const barHeight = (usage / maxUsage) * chartHeight;
              return (
                <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => setSelectedBarIndex(index === selectedBarIndex ? null : index)}>
                  <View style={{ alignItems: 'center' }}>
                    {selectedBarIndex === index && (
                      <View style={detailDashboardStyles.tooltip}>
                        <Text style={detailDashboardStyles.tooltipText}>
                          {weekDays[index]}: {formatTime(usage)}
                        </Text>
                      </View>
                    )}
                    <View style={[detailDashboardStyles.bar, { height: barHeight, backgroundColor: barColors[index] }]} />
                    <Text style={[detailDashboardStyles.xAxisLabel, { color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }]}>
                      {weekDays[index].slice(0, 3)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const detailDashboardStyles = StyleSheet.create({
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
    fontFamily: 'MadimiOne-Regular',
  },
  subtitleText: {
    fontSize: 15,
    marginTop: 5,
    fontFamily: 'MadimiOne-Regular',
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
  xAxisLabel: {
    fontSize: 14,
    fontFamily: 'MadimiOne-Regular',
  },
  chartRow: {
    flexDirection: 'row',
  },
});

// ─────────────────────────────────────────────
// 9. Componente AppDetail (vista detallada para una aplicación)
// Incluye modales para bloquear y cancelar suscripción
// ─────────────────────────────────────────────
const AppDetail = ({ selectedApp, initialMonthIndex, overallTotalMinutes, onBack, darkMode, onServiceLogin }) => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
  const appPercentage = parseFloat(selectedApp.usage.replace('%',''));
  const [selectedMonth, setSelectedMonth] = useState(initialMonthIndex);
  const [detailData, setDetailData] = useState(
    generateAppDetailData(appPercentage, overallTotalMinutes, selectedMonth)
  );
  const [blockDays, setBlockDays] = useState("0");
  const [blockHours, setBlockHours] = useState("0");
  const [blockMinutes, setBlockMinutes] = useState("0");
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  // Variables para datos de cancelación:
  const [cancelAccount, setCancelAccount] = useState("");
  const [cancelUsername, setCancelUsername] = useState("");
  const [cancelPassword, setCancelPassword] = useState("");
  
  useEffect(() => {
    setDetailData(generateAppDetailData(appPercentage, overallTotalMinutes, selectedMonth));
  }, [selectedMonth, appPercentage, overallTotalMinutes]);

  const slideAnim = useRef(new Animated.Value(500)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 500,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => onBack());
  };

  const [recommendation, setRecommendation] = useState("");
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const getRecommendation = async () => {
    let prompt = "";
    if (appPercentage > 25) {
      prompt = `La aplicación ${selectedApp.name} tiene un uso del ${appPercentage}% del tiempo total, lo que sugiere que se está utilizando en exceso y puede afectar la productividad. ¿Podrías recomendar un mensaje persuasivo para sugerir bloquear esta aplicación y reducir distracciones?`;
    } else if (appPercentage < 10) {
      prompt = `La aplicación ${selectedApp.name} tiene un uso del ${appPercentage}% del tiempo total, lo que indica que se utiliza muy poco. ¿Podrías recomendar un mensaje para sugerir cancelar la suscripción, ya que se está pagando por un servicio poco utilizado?`;
    } else {
      prompt = `La aplicación ${selectedApp.name} tiene un uso del ${appPercentage}% del tiempo total. ¿Podrías proporcionar una recomendación neutral acerca de su uso?`;
    }
    if (SIMULATE_API) {
      let simulatedResponse = "";
      if (appPercentage > 25) {
        simulatedResponse = `Reconmendación: La aplicación ${selectedApp.name} se utiliza en exceso, lo que puede afectar tu productividad. Te recomendamos bloquearla para reducir distracciones.`;
      } else if (appPercentage < 10) {
        simulatedResponse = `Reconmendación: La aplicación ${selectedApp.name} se utiliza muy poco. Considera cancelar la suscripción para evitar gastos innecesarios.`;
      } else {
        simulatedResponse = `Reconmendación: El uso de ${selectedApp.name} es moderado. No se recomienda ninguna acción específica por el momento.`;
      }
      setRecommendation(simulatedResponse);
      setLoadingRecommendation(false);
      return;
    }
    try {
      setLoadingRecommendation(true);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Eres un experto en productividad y recomendaciones de uso de aplicaciones." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        setRecommendation("Error: " + (errorData.error?.message || response.statusText));
        return;
      }
      const data = await response.json();
      if (data.error) {
        console.error("OpenAI API error:", data.error);
        setRecommendation("Error: " + data.error.message);
        return;
      }
      const recText =
        data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
          ? data.choices[0].message.content
          : "No se pudo obtener una recomendación.";
      setRecommendation(recText);
    } catch (error) {
      console.error("Error in getRecommendation:", error);
      setRecommendation("Error al obtener recomendación.");
    } finally {
      setLoadingRecommendation(false);
    }
  };

  useEffect(() => {
    getRecommendation();
  }, [selectedApp]);

  return (
    <Animated.View style={[detailStyles.container, { transform: [{ translateY: slideAnim }], backgroundColor: darkMode ? "#1B1A23" : "#F5F5F5" }]}>
      <TouchableOpacity style={detailStyles.backButton} onPress={handleBack}>
        <Text style={[detailStyles.backButtonText, { color: darkMode ? '#fff' : '#000' }]}>{'←'}</Text>
      </TouchableOpacity>
      <View style={detailStyles.appHeader}>
        <Image source={selectedApp.icon} style={detailStyles.appLogo} />
        <Text style={[detailStyles.appTitle, { color: darkMode ? '#fff' : '#000' }]}>{selectedApp.name}</Text>
      </View>
      <DetailDashboard
        darkMode={darkMode}
        detailData={detailData}
        selectedMonth={selectedMonth}
        months={months}
        onChangeMonth={setSelectedMonth}
      />
      <View style={detailStyles.recommendationContainer}>
        <Text style={[detailStyles.recommendationTitle, { color: darkMode ? '#fff' : '#000' }]}>
          Smart Recommendation
        </Text>
        {loadingRecommendation ? (
          <Text style={[detailStyles.recommendationText, { color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }]}>
            Cargando recomendación...
          </Text>
        ) : (
          <Text style={[detailStyles.recommendationText, { color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }]}>
            {recommendation}
          </Text>
        )}
        <View style={detailStyles.buttonRow}>
          <TouchableOpacity
            style={[detailStyles.detailButton, { backgroundColor: '#FECF70' }]}
            onPress={
              selectedApp.name === "PressReader"
                ? () => Linking.openURL('https://www.pressreader.com/account')
                : () => setCancelModalVisible(true)
            }
          >
            <Text style={[detailStyles.detailButtonText, { color: '#000' }]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[detailStyles.detailButton, { backgroundColor: '#FF3B30' }]}
            onPress={() => setBlockModalVisible(true)}
          >
            <Text style={[detailStyles.detailButtonText, { color: '#fff' }]}>Bloquear</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Modal para bloquear */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={blockModalVisible}
        onRequestClose={() => setBlockModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Configurar bloqueo</Text>
            <Text style={modalStyles.inputLabel}>Días:</Text>
            <View style={modalStyles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={modalStyles.pickerContent}>
                {Array.from({ length: 31 }, (_, i) => i).map((i) => (
                  <TouchableOpacity key={i} onPress={() => setBlockDays(i.toString())}>
                    <Text style={[modalStyles.pickerItem, blockDays === i.toString() && modalStyles.pickerItemSelected]}>
                      {i}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={modalStyles.inputLabel}>Horas:</Text>
            <View style={modalStyles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={modalStyles.pickerContent}>
                {Array.from({ length: 24 }, (_, i) => i).map((i) => (
                  <TouchableOpacity key={i} onPress={() => setBlockHours(i.toString())}>
                    <Text style={[modalStyles.pickerItem, blockHours === i.toString() && modalStyles.pickerItemSelected]}>
                      {i}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={modalStyles.inputLabel}>Minutos:</Text>
            <View style={modalStyles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={modalStyles.pickerContent}>
                {Array.from({ length: 60 }, (_, i) => i).map((i) => (
                  <TouchableOpacity key={i} onPress={() => setBlockMinutes(i.toString())}>
                    <Text style={[modalStyles.pickerItem, blockMinutes === i.toString() && modalStyles.pickerItemSelected]}>
                      {i}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={modalStyles.modalButton}
                onPress={() => {
                  Alert.alert(
                    "Bloqueado",
                    `La aplicación se bloqueará durante ${blockDays} días, ${blockHours} horas y ${blockMinutes} minutos.`,
                    [{ text: "OK", onPress: () => setBlockModalVisible(false) }]
                  );
                }}
              >
                <Text style={modalStyles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.modalButton, { backgroundColor: "#555" }]}
                onPress={() => setBlockModalVisible(false)}
              >
                <Text style={modalStyles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal para cancelar suscripción */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Cancelar Suscripción</Text>
            <Text style={modalStyles.inputLabel}>Cuenta del servicio:</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="ej. miCuenta123"
              placeholderTextColor="#888"
              value={cancelAccount}
              onChangeText={setCancelAccount}
            />
            <Text style={modalStyles.inputLabel}>Nombre de usuario:</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="ej. usuario@mail.com"
              placeholderTextColor="#888"
              value={cancelUsername}
              onChangeText={setCancelUsername}
            />
            <Text style={modalStyles.inputLabel}>Contraseña:</Text>
            <TextInput
              style={modalStyles.input}
              secureTextEntry
              placeholder="********"
              placeholderTextColor="#888"
              value={cancelPassword}
              onChangeText={setCancelPassword}
            />
            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={modalStyles.modalButton}
                onPress={() => {
                  if (!cancelAccount || !cancelUsername || !cancelPassword) {
                    Alert.alert("Error", "Por favor, complete todos los campos");
                    return;
                  }
                  onServiceLogin(selectedApp);
                  const url = cancellationURLs[selectedApp.name] || "";
                  if (url) {
                    Linking.openURL(url);
                  } else {
                    Alert.alert("Aviso", "No se definió URL para este servicio.");
                  }
                  setCancelModalVisible(false);
                  setCancelAccount("");
                  setCancelUsername("");
                  setCancelPassword("");
                }}
              >
                <Text style={modalStyles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.modalButton, { backgroundColor: "#555" }]}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={modalStyles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 5,
  },
  backButtonText: {
    fontSize: 20,
    fontFamily: 'MadimiOne-Regular',
  },
  appHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 5,
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'MadimiOne-Regular',
  },
  recommendationContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  recommendationTitle: {
    fontSize: 24,
    marginBottom: 10,
    fontFamily: 'MadimiOne-Regular',
  },
  recommendationText: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'MadimiOne-Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  detailButtonText: {
    fontSize: 16,
    fontFamily: 'MadimiOne-Regular',
  },
});

// ─────────────────────────────────────────────
// Estilos para modales (cancelación y bloqueo)
// ─────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#1B1A23", // Fondo de la app
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "MadimiOne-Regular",
    marginBottom: 15,
    textAlign: "center",
    color: "#fff",
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "MadimiOne-Regular",
    marginBottom: 5,
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 5,
    padding: 8,
    marginBottom: 15,
    fontSize: 16,
    color: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 5,
    marginBottom: 15,
    paddingVertical: 10,
  },
  pickerContent: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  pickerItem: {
    fontSize: 16,
    fontFamily: "MadimiOne-Regular",
    paddingHorizontal: 10,
    color: "#fff",
  },
  pickerItemSelected: {
    color: "#FECF70",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  modalButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "MadimiOne-Regular",
    color: "#fff",
  },
});

// ─────────────────────────────────────────────
// Estilos para el modal de "Servicios Iniciados"
// ─────────────────────────────────────────────
const loggedInModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#1B1A23",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "MadimiOne-Regular",
    marginBottom: 15,
    color: "#fff",
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    fontFamily: "MadimiOne-Regular",
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#555",
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 18,
    fontFamily: 'MadimiOne-Regular',
    color: '#fff',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    fontSize: 14,
    fontFamily: 'MadimiOne-Regular',
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'MadimiOne-Regular',
    color: '#fff',
  },
});

// ─────────────────────────────────────────────
// 10. Componente principal de la App (navegación entre vistas)
// ─────────────────────────────────────────────
const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(-menuWidth)).current;
  const [showLoggedInModal, setShowLoggedInModal] = useState(false);
  const [loggedInServices, setLoggedInServices] = useState([]);
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
  const generateAppsData = () => {
    const appNames = ['Netflix', 'HBO Max', 'Disney +', 'Spotify', 'Prime Video', 'PressReader'];
    const weights = appNames.map(() => Math.random());
    const totalWeight = weights.reduce((acc, cur) => acc + cur, 0);
    const percentages = weights.map(w => (w / totalWeight) * 100);
    const logos = {
      Netflix: require('./assets/Logo-Icons/Netflix.png'),
      "HBO Max": require('./assets/Logo-Icons/HBOMax.jpg'),
      "Disney +": require('./assets/Logo-Icons/disney.jpg'),
      Spotify: require('./assets/Logo-Icons/Spotify.png'),
      "Prime Video": require('./assets/Logo-Icons/PrimeVideo.png'),
      PressReader: require('./assets/Logo-Icons/PressReader.png'),
    };
    const apps = appNames.map((name, index) => {
      const usagePercent = Math.round(percentages[index]);
      return { name, usage: `${usagePercent}%`, icon: logos[name] };
    });
    return apps;
  };
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [dashboardData, setDashboardData] = useState(generateDashboardData());
  const [appsData, setAppsData] = useState(generateAppsData());
  const handleChangeMonth = (newIndex) => {
    setSelectedMonthIndex(newIndex);
    setDashboardData(generateDashboardData());
    setAppsData(generateAppsData());
  };
  const [selectedApp, setSelectedApp] = useState(null);
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
  const handleServiceLogin = (service) => {
    setLoggedInServices(prev => {
      if (prev.find(s => s.name === service.name)) return prev;
      return [...prev, service];
    });
  };
  const removeService = (serviceName) => {
    setLoggedInServices(prev => prev.filter(s => s.name !== serviceName));
  };
  const backgroundColor = darkMode ? "#1B1A23" : "#F5F5F5";
  const menuBackground = darkMode ? "#2A2938" : "#fff";
  const menuTextColor = darkMode ? "#fff" : "#000";
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={backgroundColor} />
      <TopBar darkMode={darkMode} toggleMenu={toggleMenu} onAvatarPress={() => setShowLoggedInModal(true)} />
      <ScrollView contentContainerStyle={styles.content}>
        {selectedApp ? (
          <AppDetail
            selectedApp={selectedApp}
            initialMonthIndex={selectedMonthIndex}
            overallTotalMinutes={dashboardData.totalMinutes}
            onBack={() => setSelectedApp(null)}
            darkMode={darkMode}
            onServiceLogin={handleServiceLogin}
          />
        ) : (
          <>
            <Dashboard
              darkMode={darkMode}
              dashboardData={dashboardData}
              onChangeMonth={handleChangeMonth}
              selectedMonthIndex={selectedMonthIndex}
              months={months}
            />
            <ApplicationsList darkMode={darkMode} appsData={appsData} onSelectApp={setSelectedApp} />
          </>
        )}
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
      {/* Modal de Servicios Iniciados */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLoggedInModal}
        onRequestClose={() => setShowLoggedInModal(false)}
      >
        <View style={loggedInModalStyles.modalOverlay}>
          <View style={loggedInModalStyles.modalContainer}>
            <Text style={loggedInModalStyles.modalTitle}>Servicios Iniciados</Text>
            {loggedInServices.length === 0 ? (
              <Text style={loggedInModalStyles.modalText}>No has iniciado sesión en ningún servicio.</Text>
            ) : (
              loggedInServices.map((service, index) => (
                <View key={index} style={loggedInModalStyles.serviceRow}>
                  <View style={loggedInModalStyles.serviceInfo}>
                    <Image source={service.icon} style={loggedInModalStyles.serviceImage} />
                    <Text style={loggedInModalStyles.serviceName}>{service.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={loggedInModalStyles.removeButton}
                    onPress={() => removeService(service.name)}
                  >
                    <Text style={loggedInModalStyles.removeButtonText}>Cerrar sesión</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
            <TouchableOpacity style={loggedInModalStyles.closeButton} onPress={() => setShowLoggedInModal(false)}>
              <Text style={loggedInModalStyles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

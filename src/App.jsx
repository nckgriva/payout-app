import { useState, useEffect } from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Container,
  IconButton,
  Divider,
} from '@mui/material';
import { CalendarToday, DateRange, AddBox, Delete } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const iosTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#0A84FF' },
    error: { main: '#FF453A' },
    background: { default: '#000000', paper: '#1C1C1E' },
    text: { primary: '#FFFFFF', secondary: 'rgba(235,235,245,0.6)' },
    divider: 'rgba(255,255,255,0.1)',
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: '#000000' } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#1C1C1E',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, fontSize: 17, padding: '13px', fontWeight: 600 },
        containedPrimary: { backgroundColor: '#0A84FF' },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: { '&.Mui-checked': { color: '#fff' }, '&.Mui-checked + .MuiSwitch-track': { backgroundColor: '#30D158' } },
        track: { borderRadius: 12 },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          height: 60,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: 'rgba(235,235,245,0.4)',
          minWidth: 0,
          padding: '8px 0 0',
          '&.Mui-selected': { color: '#0A84FF' },
        },
        label: { fontSize: 10, marginTop: 2, '&.Mui-selected': { fontSize: 10 } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        colorError: { color: '#FF453A' },
      },
    },
  },
});

// iOS-стиль: навбар с blur
const NavBar = ({ title }) => (
  <Box sx={{
    position: 'sticky', top: 0, zIndex: 100,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderBottom: '0.5px solid rgba(255,255,255,0.12)',
    px: 2, py: 1.5,
    textAlign: 'center',
  }}>
    <Typography sx={{ fontWeight: 600, fontSize: 17, letterSpacing: -0.4 }}>{title}</Typography>
  </Box>
);

// iOS-стиль: секция-карточка
const Section = ({ children, sx }) => (
  <Box sx={{ backgroundColor: '#1C1C1E', borderRadius: '12px', overflow: 'hidden', ...sx }}>
    {children}
  </Box>
);

// iOS-стиль: строка списка
const ListRow = ({ left, right, onDelete, isLast }) => (
  <>
    <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.25, minHeight: 44 }}>
      <Typography sx={{ flex: 1, fontSize: 16 }}>{left}</Typography>
      <Typography sx={{ fontSize: 16, color: 'rgba(235,235,245,0.6)', mr: onDelete ? 0.5 : 0 }}>{right}</Typography>
      {onDelete && (
        <IconButton size="small" onClick={onDelete} color="error" sx={{ ml: 0.5 }}>
          <Delete fontSize="small" />
        </IconButton>
      )}
    </Box>
    {!isLast && <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', ml: 2 }} />}
  </>
);

// iOS-стиль: сегментированный контрол
const SegmentedControl = ({ value, options, onChange }) => (
  <Box sx={{
    display: 'flex',
    backgroundColor: 'rgba(118,118,128,0.24)',
    borderRadius: '9px',
    p: '2px',
  }}>
    {options.map(opt => (
      <Box
        key={opt.value}
        onClick={() => onChange(opt.value)}
        sx={{
          flex: 1, textAlign: 'center', py: '6px',
          borderRadius: '7px',
          backgroundColor: value === opt.value ? '#FFFFFF' : 'transparent',
          color: value === opt.value ? '#000000' : 'rgba(235,235,245,0.6)',
          fontWeight: 600, fontSize: 14, cursor: 'pointer',
          transition: 'background-color 0.2s, color 0.2s',
          userSelect: 'none',
        }}
      >
        {opt.label}
      </Box>
    ))}
  </Box>
);

function App() {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem('@procedures_data');
    if (savedData) setItems(JSON.parse(savedData));
    setLoading(false);
  }, []);

  const saveData = (newData) => {
    localStorage.setItem('@procedures_data', JSON.stringify(newData));
    setItems(newData);
  };

  const calculatePayout = (price, tax, percent) => {
    const afterTax = price - (price * (parseFloat(tax) / 100));
    return afterTax * (parseInt(percent) / 100);
  };

  // --- ЭКРАН: ВВОД ---
  const InputRoute = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [tax, setTax] = useState('0');
    const [payment, setPayment] = useState('40');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [direct, setDirect] = useState(false);

    const handleAdd = () => {
      if (!name || !price) return alert("Заполните название и цену");
      const newItem = {
        id: Date.now().toString(),
        name,
        price: parseFloat(price),
        tax: direct ? 0 : parseFloat(tax),
        payment: direct ? '100' : payment,
        date,
      };
      saveData([...items, newItem]);
      setName(''); setPrice('');
      setIndex(0);
    };

    return (
      <Box sx={{ pb: 10, minHeight: '100dvh', backgroundColor: '#000' }}>
        <NavBar title="Новая запись" />
        <Container sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Дата" type="date" value={date} onChange={(e) => setDate(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Название" value={name} onChange={(e) => setName(e.target.value)} fullWidth />

          <Section sx={{ px: 2, py: 1 }}>
            <FormControlLabel
              control={<Switch checked={direct} onChange={(e) => setDirect(e.target.checked)} />}
              label={<Typography sx={{ fontSize: 16 }}>Без вычетов</Typography>}
              sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse' }}
            />
          </Section>

          <TextField
            label={direct ? "Сумма выплаты" : "Стоимость"}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
          />

          {!direct && <>
            <TextField label="Налог %" type="number" value={tax} onChange={(e) => setTax(e.target.value)} fullWidth />
            <Box>
              <Typography sx={{ fontSize: 13, color: 'rgba(235,235,245,0.6)', mb: 1, ml: 0.5 }}>Процент выплаты</Typography>
              <SegmentedControl
                value={payment}
                options={[{ value: '40', label: '40%' }, { value: '50', label: '50%' }]}
                onChange={setPayment}
              />
            </Box>
          </>}

          <Button variant="contained" size="large" onClick={handleAdd} fullWidth sx={{ mt: 1 }}>
            Сохранить
          </Button>
        </Container>
      </Box>
    );
  };

  // --- ЭКРАН: ДЕНЬ ---
  const DayRoute = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const dayItems = items.filter(i => i.date === selectedDate);
    const totalRev = dayItems.reduce((s, i) => s + i.price, 0);
    const totalPay = dayItems.reduce((s, i) => s + calculatePayout(i.price, i.tax, i.payment), 0);

    const deleteItem = (id) => {
      if (window.confirm("Удалить запись?")) saveData(items.filter(i => i.id !== id));
    };

    return (
      <Box sx={{ pb: 10, minHeight: '100dvh', backgroundColor: '#000' }}>
        <NavBar title="День" />
        <Container sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Дата" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />

          <Section>
            <Box sx={{ px: 2, py: 2 }}>
              <Typography sx={{ fontSize: 13, color: 'rgba(235,235,245,0.6)', mb: 0.5 }}>ОБОРОТ</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{totalRev.toFixed(2)} ₽</Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            <Box sx={{ px: 2, py: 2 }}>
              <Typography sx={{ fontSize: 13, color: 'rgba(235,235,245,0.6)', mb: 0.5 }}>ВЫПЛАТА</Typography>
              <Typography sx={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: '#30D158' }}>
                {Math.max(totalPay, 1500).toFixed(2)} ₽
              </Typography>
            </Box>
          </Section>

          {dayItems.length > 0 && (
            <Section>
              {dayItems.map((i, idx) => (
                <ListRow
                  key={i.id}
                  left={i.name}
                  right={`${calculatePayout(i.price, i.tax, i.payment).toFixed(0)} ₽`}
                  onDelete={() => deleteItem(i.id)}
                  isLast={idx === dayItems.length - 1}
                />
              ))}
            </Section>
          )}
        </Container>
      </Box>
    );
  };

  // --- ЭКРАН: МЕСЯЦ ---
  const MonthRoute = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const monthItems = items.filter(i => i.date.startsWith(selectedMonth));
    const totalRev = monthItems.reduce((s, i) => s + i.price, 0);
    const daysMap = monthItems.reduce((acc, i) => {
      if (!acc[i.date]) acc[i.date] = { totalRev: 0, totalPay: 0 };
      acc[i.date].totalRev += i.price;
      acc[i.date].totalPay += calculatePayout(i.price, i.tax, i.payment);
      return acc;
    }, {});
    const totalPayWithFloor = Object.values(daysMap).reduce((s, d) => s + Math.max(d.totalPay, 1500), 0);

    return (
      <Box sx={{ pb: 10, minHeight: '100dvh', backgroundColor: '#000' }}>
        <NavBar title="Месяц" />
        <Container sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Месяц" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />

          <Section>
            <Box sx={{ px: 2, py: 2 }}>
              <Typography sx={{ fontSize: 13, color: 'rgba(235,235,245,0.6)', mb: 0.5 }}>ОБОРОТ</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{totalRev.toFixed(2)} ₽</Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            <Box sx={{ px: 2, py: 2 }}>
              <Typography sx={{ fontSize: 13, color: 'rgba(235,235,245,0.6)', mb: 0.5 }}>ПРИБЫЛЬ</Typography>
              <Typography sx={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: '#30D158' }}>
                {totalPayWithFloor.toFixed(2)} ₽
              </Typography>
            </Box>
          </Section>

          {Object.keys(daysMap).length > 0 && (
            <>
              <Typography sx={{ fontSize: 13, color: 'rgba(235,235,245,0.6)', ml: 1 }}>ИСТОРИЯ ПО ДНЯМ</Typography>
              <Section>
                {Object.keys(daysMap).sort().map((date, idx, arr) => (
                  <ListRow
                    key={date}
                    left={date}
                    right={`${Math.max(daysMap[date].totalPay, 1500).toFixed(2)} ₽`}
                    isLast={idx === arr.length - 1}
                  />
                ))}
              </Section>
            </>
          )}
        </Container>
      </Box>
    );
  };

  if (loading) return null;

  return (
    <ThemeProvider theme={iosTheme}>
      <CssBaseline />
      <Box sx={{ backgroundColor: '#000', minHeight: '100dvh' }}>
        {index === 0 && <DayRoute />}
        {index === 1 && <MonthRoute />}
        {index === 2 && <InputRoute />}

        <Box sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,0.75)',
          borderTop: '0.5px solid rgba(255,255,255,0.12)',
          pb: 'env(safe-area-inset-bottom)',
        }}>
          <BottomNavigation value={index} onChange={(_, v) => setIndex(v)} showLabels>
            <BottomNavigationAction label="День" icon={<CalendarToday />} />
            <BottomNavigationAction label="Месяц" icon={<DateRange />} />
            <BottomNavigationAction label="Добавить" icon={<AddBox />} />
          </BottomNavigation>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

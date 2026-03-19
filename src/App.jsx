import { useState, useEffect } from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  Container,
  AppBar,
  Toolbar
} from '@mui/material';
import { 
  CalendarToday, 
  DateRange, 
  AddBox, 
  Delete 
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка данных (аналог AsyncStorage)
  useEffect(() => {
    const savedData = localStorage.getItem('@procedures_data');
    if (savedData) {
      setItems(JSON.parse(savedData));
    }
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
        date
      };

      const updatedList = [...items, newItem];
      saveData(updatedList);
      setName(''); setPrice('');
      setIndex(0);
    };

    return (
      <Box sx={{ pb: 7 }}>
        <AppBar position="static">
          <Toolbar><Typography variant="h6">Новая запись</Typography></Toolbar>
        </AppBar>
        <Container sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Дата" type="date" value={date} onChange={(e) => setDate(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Название" value={name} onChange={(e) => setName(e.target.value)} fullWidth />

          <FormControlLabel
            control={<Switch checked={direct} onChange={(e) => setDirect(e.target.checked)} />}
            label="Без вычетов (прямая сумма)"
          />

          <TextField
            label={direct ? "Сумма выплаты" : "Стоимость"}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
          />

          {!direct && <>
            <TextField label="Налог %" type="number" value={tax} onChange={(e) => setTax(e.target.value)} fullWidth />
            <FormControl>
              <FormLabel>Процент выплаты:</FormLabel>
              <RadioGroup row value={payment} onChange={(e) => setPayment(e.target.value)}>
                <FormControlLabel value="40" control={<Radio />} label="40%" />
                <FormControlLabel value="50" control={<Radio />} label="50%" />
              </RadioGroup>
            </FormControl>
          </>}

          <Button variant="contained" size="large" onClick={handleAdd} sx={{ mt: 2 }}>
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
      if(window.confirm("Удалить запись?")) {
        const filtered = items.filter(i => i.id !== id);
        saveData(filtered);
      }
    };

    return (
      <Box sx={{ pb: 7 }}>
        <AppBar position="static">
          <Toolbar><Typography variant="h6">День</Typography></Toolbar>
        </AppBar>
        <Container sx={{ mt: 2 }}>
          <TextField label="Выбранная дата" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} sx={{ mb: 2 }} />
          
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Оборот: {totalRev.toFixed(2)} ₽</Typography>
              <Typography variant="h5">Сумма: {Math.max(totalPay, 1500).toFixed(2)} ₽</Typography>
            </CardContent>
          </Card>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Имя</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dayItems.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.name}</TableCell>
                    <TableCell align="right">{calculatePayout(i.price, i.tax, i.payment).toFixed(0)} ₽</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => deleteItem(i.id)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
      <Box sx={{ pb: 7 }}>
        <AppBar position="static">
          <Toolbar><Typography variant="h6">Месяц</Typography></Toolbar>
        </AppBar>
        <Container sx={{ mt: 2 }}>
          <TextField label="Месяц" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} sx={{ mb: 2 }} />
          <Card>
            <CardContent>
              <Typography>Оборот: {totalRev.toFixed(2)} ₽</Typography>
              <Typography variant="h6">Прибыль: {totalPayWithFloor.toFixed(2)} ₽</Typography>
            </CardContent>
          </Card>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>История по дням:</Typography>
          {Object.keys(daysMap).sort().map(date => (
            <Paper key={date} variant="outlined" sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight="bold">{date}</Typography>
              <Typography>Сумма: {Math.max(daysMap[date].totalPay, 1500).toFixed(2)} ₽</Typography>
              <Typography>Оборот: {daysMap[date].totalRev.toFixed(2)} ₽</Typography>
            </Paper>
          ))}
        </Container>
      </Box>
    );
  };

  if (loading) return null;

  return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
    <Box>
      {index === 0 && <DayRoute />}
      {index === 1 && <MonthRoute />}
      {index === 2 && <InputRoute />}

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0,  margin: '0 auto' }} elevation={3}>
        <BottomNavigation
          showLabels
          value={index}
          onChange={(_, newValue) => setIndex(newValue)}
        >
          <BottomNavigationAction label="День" icon={<CalendarToday />} />
          <BottomNavigationAction label="Месяц" icon={<DateRange />} />
          <BottomNavigationAction label="Добавить" icon={<AddBox />} />
        </BottomNavigation>
      </Paper>
    </Box>
      </ThemeProvider>
  );
}

export default App;

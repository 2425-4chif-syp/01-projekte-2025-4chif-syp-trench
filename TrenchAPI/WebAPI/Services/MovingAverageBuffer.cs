namespace TrenchAPI.WebAPI.Services
{
    /// <summary>
    /// Gleitender Mittelwert mit Double Linked List - O(1) für alle Operationen
    /// Thread-safe für Verwendung mit ConcurrentDictionary
    /// 
    /// Strategie:
    /// - Fenster noch nicht voll: Jeden Wert mit aktuellem Durchschnitt ausgeben (schnelles Feedback)
    /// - Fenster voll: Nur jeden N-ten Wert ausgeben (Downsampling)
    /// </summary>
    public class MovingAverageBuffer
    {
        private readonly LinkedList<decimal> _values = new LinkedList<decimal>();
        private readonly int _windowSize;
        private decimal _total = 0;
        private int _sampleCount = 0;
        private readonly int _outputEveryN;  // Nur jeden N-ten Wert ausgeben (nach Warmup)
        private readonly object _lock = new object();  // Lock für Thread-Safety

        public MovingAverageBuffer(int windowSize, int outputEveryN = 10)
        {
            _windowSize = windowSize;
            _outputEveryN = outputEveryN;
        }

        /// <summary>
        /// Fügt neuen Wert hinzu und gibt geglätteten Wert zurück wenn bereit
        /// Thread-safe durch Lock
        /// </summary>
        /// <param name="value">Neuer Rohwert</param>
        /// <param name="smoothedValue">Geglätteter Mittelwert (nur wenn return true)</param>
        /// <returns>true wenn ein Ausgabewert bereit ist</returns>
        public bool AddValue(decimal value, out decimal smoothedValue)
        {
            lock (_lock)
            {
                // Neuen Wert am Anfang hinzufügen
                _total += value;
                _values.AddFirst(value);
                _sampleCount++;

                // Wenn Fenster voll, ältesten Wert entfernen
                if (_values.Count > _windowSize)
                {
                    decimal lastValue = _values.Last!.Value;
                    _values.RemoveLast();
                    _total -= lastValue;
                }

                // WARMUP-PHASE: Fenster noch nicht voll → jeden Wert ausgeben
                // Das sorgt für sofortiges Feedback bei allen Sensoren
                if (_values.Count < _windowSize)
                {
                    smoothedValue = _total / _values.Count;
                    return true;  // Jeden Wert während Warmup ausgeben
                }

                // NORMAL-PHASE: Fenster voll → nur jeden N-ten Wert ausgeben
                if (_sampleCount >= _outputEveryN)
                {
                    smoothedValue = _total / _values.Count;
                    _sampleCount = 0;
                    return true;
                }

                smoothedValue = 0;
                return false;
            }
        }

        public void Reset()
        {
            lock (_lock)
            {
                _values.Clear();
                _total = 0;
                _sampleCount = 0;
            }
        }
    }
}

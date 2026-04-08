import { useState } from 'react';
import './App.css';

const subnetOptions = [
  { cidr: 32, mask: '255.255.255.255' },
  { cidr: 31, mask: '255.255.255.254' },
  { cidr: 30, mask: '255.255.255.252' },
  { cidr: 29, mask: '255.255.255.248' },
  { cidr: 28, mask: '255.255.255.240' },
  { cidr: 27, mask: '255.255.255.224' },
  { cidr: 26, mask: '255.255.255.192' },
  { cidr: 25, mask: '255.255.255.128' },
  { cidr: 24, mask: '255.255.255.0' },
  { cidr: 23, mask: '255.255.254.0' },
  { cidr: 22, mask: '255.255.252.0' },
  { cidr: 21, mask: '255.255.248.0' },
  { cidr: 20, mask: '255.255.240.0' },
  { cidr: 19, mask: '255.255.224.0' },
  { cidr: 18, mask: '255.255.192.0' },
  { cidr: 17, mask: '255.255.128.0' },
  { cidr: 16, mask: '255.255.0.0' },
  { cidr: 15, mask: '255.254.0.0' },
  { cidr: 14, mask: '255.252.0.0' },
  { cidr: 13, mask: '255.248.0.0' },
  { cidr: 12, mask: '255.240.0.0' },
  { cidr: 11, mask: '255.224.0.0' },
  { cidr: 10, mask: '255.192.0.0' },
  { cidr: 9, mask: '255.128.0.0' },
  { cidr: 8, mask: '255.0.0.0' },
  { cidr: 7, mask: '254.0.0.0' },
  { cidr: 6, mask: '252.0.0.0' },
  { cidr: 5, mask: '248.0.0.0' },
  { cidr: 4, mask: '240.0.0.0' },
  { cidr: 3, mask: '224.0.0.0' },
  { cidr: 2, mask: '192.0.0.0' },
  { cidr: 1, mask: '128.0.0.0' },
  { cidr: 0, mask: '0.0.0.0' },
];
function App() {
  const [ipAddress, setIpAddress] = useState('192.168.1.1');
  const [cidr, setCidr] = useState('24');
  const [isClicked, setIsClicked] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  const [error, setError] = useState('');

  function ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    return (
      ((parts[0] << 24) >>> 0) +
      ((parts[1] << 16) >>> 0) +
      ((parts[2] << 8) >>> 0) +
      (parts[3] >>> 0)
    ) >>> 0;
  }

  function intToIp(int) {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255,
    ].join('.');
  }

  function isValidIp(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    return parts.every((part) => {
      const num = Number(part);
      return part !== '' && !isNaN(num) && num >= 0 && num <= 255;
    });
  }



  function calculateSubnet() {
    const cidrNum = Number(cidr);
    setError('');
    if (!isValidIp(ipAddress)) {
      setError('Please enter a valid IPv4 address.');
      return;
    }

    if (isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32) {
      setError('CIDR must be between 0 and 32.');
      return;
    }

    const ipInt = ipToInt(ipAddress);
    const maskInt = cidrNum === 0 ? 0 : (0xffffffff << (32 - cidrNum)) >>> 0;
    const networkInt = ipInt & maskInt;
    const broadcastInt = networkInt | (~maskInt >>> 0);

    const totalHosts = 2 ** (32 - cidrNum);

    let usableHosts;
    let firstHost;
    let lastHost;

    if (cidrNum === 32) {
      usableHosts = 1;
      firstHost = intToIp(networkInt);
      lastHost = intToIp(networkInt);
    } else if (cidrNum === 31) {
      usableHosts = 2;
      firstHost = intToIp(networkInt);
      lastHost = intToIp(broadcastInt);
    } else {
      usableHosts = totalHosts - 2;
      firstHost = intToIp(networkInt + 1);
      lastHost = intToIp(broadcastInt - 1);
    }

    setResultData({
      ipAddress,
      subnetMask: intToIp(maskInt),
      cidr: `/${cidrNum}`,
      networkAddress: intToIp(networkInt),
      broadcastAddress: intToIp(broadcastInt),
      firstHost,
      lastHost,
      usableHostRange: `${firstHost} - ${lastHost}`,
      totalHosts,
      usableHosts,
    });
    setIsClicked(true);
  }

  function Result() {
    if (!resultData) return null;

    return (
      <div className="results-container">
        <h2>Subnet Calculation Results</h2>

        <CopyableRow
          label="IP Address"
          value={resultData.ipAddress}
          fieldName="ipAddress"
        />

        <CopyableRow
          label="Network Address"
          value={resultData.networkAddress}
          fieldName="networkAddress"
        />

        <CopyableRow
          label="Usable Host IP Range"
          value={resultData.usableHostRange}
          fieldName="usableHostRange"
        />

        <CopyableRow
          label="Broadcast Address"
          value={resultData.broadcastAddress}
          fieldName="broadcastAddress"
        />

        <CopyableRow
          label="Total Number of Hosts"
          value={String(resultData.totalHosts)}
          fieldName="totalHosts"
        />

        <CopyableRow
          label="Number of Usable Hosts"
          value={String(resultData.usableHosts)}
          fieldName="usableHosts"
        />

        <CopyableRow
          label="Subnet Mask"
          value={resultData.subnetMask}
          fieldName="subnetMask"
        />

        <CopyableRow
          label="CIDR Notation"
          value={resultData.cidr}
          fieldName="cidr"
        />

        <CopyableRow
          label="First Usable Host"
          value={resultData.firstHost}
          fieldName="firstHost"
        />

        <CopyableRow
          label="Last Usable Host"
          value={resultData.lastHost}
          fieldName="lastHost"
        />

        <button
          onClick={() => {
            setIsClicked(false);
            setResultData(null);
            setCopiedField('');
          }}
        >
          Back
        </button>
      </div>
    );
  }

  async function copyToClipboard(text, fieldName) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);

      setTimeout(() => {
        setCopiedField('');
      }, 1200);
    } catch (error) {
      console.error('Copy failed', error);
    }
  }
  function CopyableRow({ label, value, fieldName }) {
    return (
      <p
        className="copyable"
        title="Click to copy"
        onClick={() => copyToClipboard(value, fieldName)}
      >
        <strong>{label}:</strong> {value}
        {copiedField === fieldName && (
          <span className="copied-text">Copied!</span>
        )}
      </p>
    );
  }
  return (
    <div className="main-container">
      <h1>IP Subnet Calculator</h1>
      <p>
        Calculate subnet mask, network address, broadcast address, usable hosts, and IP ranges instantly.
      </p>

      {!isClicked && (
        <div className="form-container">
          <h2>Enter network details</h2>

          <div className="input-group">
            <label htmlFor="ipAddress">IP Address:</label>
            <input
              type="text"
              id="ipAddress"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g. 192.168.1.10"
            />
          </div>

          <div className="input-group">
            <label htmlFor="cidr">Subnet Mask / CIDR:</label>
            <select
              id="cidr"
              value={cidr}
              onChange={(e) => setCidr(e.target.value)}
            >
              {subnetOptions.map((option) => (
                <option key={option.cidr} value={option.cidr}>
                  {option.mask} (/{option.cidr})
                </option>
              ))}
            </select>
          </div>
          {error && <div className="error-box">{error}</div>}
          <button className="calculate-button" onClick={calculateSubnet}>
            Calculate
          </button>
        </div>
      )}

      {isClicked && resultData && <Result />}
    </div>
  );
}

export default App;
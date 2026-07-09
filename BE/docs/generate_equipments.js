const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Query all systems from the running MySQL docker container
  console.log('Querying systems from docker database...');
  const output = execSync(
    'docker exec -i scms_mysql_db mysql -uroot -proot scms_db -N -e "SELECT BIN_TO_UUID(system_id), system_code, system_name FROM equipment_system;"',
    { encoding: 'utf8' }
  );

  const lines = output.trim().split('\n');
  const systems = [];

  lines.forEach(line => {
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const id = parts[0].trim();
      const code = parts[1].trim();
      const name = parts[2] ? parts[2].trim() : code;
      systems.push({ id, code, name });
    }
  });

  console.log(`Found ${systems.length} systems in database.`);

  if (systems.length === 0) {
    console.error('No systems found in database. Please seed systems first.');
    process.exit(1);
  }

  let sql = "USE scms_db;\n\n";
  sql += "INSERT INTO `equipment` (`equipment_id`, `kks_code`, `name`, `type`, `status`, `location`, `system_id`) VALUES\n";

  const types = ['Co khi', 'Dien', 'CI'];
  const statuses = ['Hoạt động', 'Bảo dưỡng', 'Sự cố'];
  const locations = ['Tang 1', 'Tang 2', 'Ngoai troi', 'Trong tu dieu khien'];

  let values = [];

  systems.forEach((sys, sysIdx) => {
    console.log(`Generating 20 equipments for system ${sys.code} (${sys.name})...`);
    for (let i = 1; i <= 20; i++) {
      const sysHex = sysIdx.toString(16).padStart(4, '0');
      const indexHex = i.toString(16).padStart(12, '0');
      const uuid = `32000000-0000-0000-${sysHex}-${indexHex}`;
      const kks = `${sys.code}-EQ-${i.toString().padStart(3, '0')}`;
      const name = `Thiet bi ${i} - ${sys.name}`;
      const type = types[(sysIdx + i) % types.length];
      const status = statuses[(sysIdx + i) % statuses.length];
      const loc = `Khu vuc ${sys.name} - ${locations[(sysIdx + i) % locations.length]}`;
      
      values.push(`(UUID_TO_BIN('${uuid}'), '${kks}', '${name}', '${type}', '${status}', '${loc}', UUID_TO_BIN('${sys.id}'))`);
    }
  });

  sql += values.join(",\n") + "\nON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), status=VALUES(status), location=VALUES(location), system_id=VALUES(system_id);\n";

  fs.writeFileSync('BE/docs/generate_large_seed.sql', sql, 'utf8');
  console.log('generate_large_seed.sql written successfully.');
} catch (error) {
  console.error('Error running script:', error.message);
  process.exit(1);
}

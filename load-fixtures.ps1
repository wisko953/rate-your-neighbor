Write-Host "Chargement des fixtures..." -ForegroundColor Cyan

$containerId = docker-compose ps -q mysql
docker cp fixtures.sql "${containerId}:/tmp/fixtures.sql"
docker-compose exec mysql bash -c "mysql -u root -prootpassword --default-character-set=utf8mb4 rate_your_neighbor < /tmp/fixtures.sql"

Write-Host "`nFixtures chargées avec succès !" -ForegroundColor Green

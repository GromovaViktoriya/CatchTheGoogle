- place players to the grid (random position for both players) // first set players then google
- google must jump to empty cell (if player is in the cell - jump to other cell)
- stop game after google will take necessary points

Create Classes: 
Пообщаться с gemini на счет тем ниже (theory)
- информационный эксперт/создатель (GRASP) (theory)
- backward compatibility (theory)
- entity objects vs value objects (DDD) (theory)
- dependency injection
- создать класс для Position, в конструктор передать new Position (x, y) и внутри сделать метод equals, который 
- возвращает либо true либо false:
- new Position (x, y): position1.equals(position2) === true
- new Settings (new GridSettings), new GoogleSettings // don't do DI, пускай объекты рождаются внутри
- class Settings {
- constructor(){
- this.GridSettings = new GridSettings()
- this.GoogleSettings = new GoogleSettings()
- }

TZ2
- добавить player2
- добавить проверку, что второй игрок не блокирует передвижение первого игрока (в тот же тест)
- добавить пару перемещений для второго игрока
- стоп игра когда player выигрывает
- добавить play again


булевая логика выносится в переменные и пишется по закону де Моргана в положительном ключе, без отрицания
const isInRange = x>=0 && x<gridSize.columnsCount Закон де Моргана
const isNotInRange = x<0 || x>= gridSize.columnsCount
if (!isInRange){...}

TZ3
Сделать всю игру согласно ТЗ.
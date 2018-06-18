// ストア
store = new Object();
// 棋譜
// [{"count": int, "owner": string, "kind": string, "from": [int, int], "to": [int, int], "nari": bool}, {...}]
store.kifu = [];
store.addKifu = function(owner, kind, from, to, nari) {
  if (store.kifu.length > 0) {
    var count = store.kifu[store.kifu.length - 1] + 1;
    store.kifu.push({"count": count, "owner": owner, "kind": kind, "from": from, "to": to, "nari": nari});
  } else {
    store.kifu.push({"count": 1, "owner": owner, "kind": kind, "from": from, "to": to, "nari": nari});
  }
}
// 手番 String
store.turn = "white";
store.getTurn = function() {
  return store.turn;
}
store.changeTurn = function() {
  if (store.turn === "white") {
    store.turn = "black";
  } else {
    store.turn = "white";
  }
}
// 選択されているかどうか bool
store.isSelected = false;
// 選択されている駒 element
store.selectedKoma = null;
store.selectKoma = function($Element) {
  store.isSelected = true;
  store.selectedKoma = $Element;
}
store.unselectKoma = function() {
  store.isSelected = false;
  store.selectedKoma = {};
}

// 初期配置の配列
var initPosition = [
  [{"owner": "black", "kind": "KY"}, {"owner": "black", "kind": "KE"}, {"owner": "black", "kind": "GI"}, {"owner": "black", "kind": "KI"}, {"owner": "black", "kind": "OU"}, {"owner": "black", "kind": "KI"}, {"owner": "black", "kind": "GI"}, {"owner": "black", "kind": "KE"}, {"owner": "black", "kind": "KY"}],
  [{}, {"owner": "black", "kind": "HI"}, {}, {}, {}, {}, {}, {"owner": "black", "kind": "KA"}, {}],
  [{"owner": "black", "kind": "FU"}, {"owner": "black", "kind": "FU"}, {"owner": "black", "kind": "FU"}, {"owner": "black", "kind": "FU"}, {"owner": "black", "kind": "FU"}, {"owner": "black", "kind": "FU"}, {"owner": "black", "kind": "FU"}, {"owner": "black", "kind": "FU"}, {"owner": "black", "kind": "FU"}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{"owner": "white", "kind": "FU"}, {"owner": "white", "kind": "FU"}, {"owner": "white", "kind": "FU"}, {"owner": "white", "kind": "FU"}, {"owner": "white", "kind": "FU"}, {"owner": "white", "kind": "FU"}, {"owner": "white", "kind": "FU"}, {"owner": "white", "kind": "FU"}, {"owner": "white", "kind": "FU"}],
  [{}, {"owner": "white", "kind": "KA"}, {}, {}, {}, {}, {}, {"owner": "white", "kind": "HI"}, {}],
  [{"owner": "white", "kind": "KY"}, {"owner": "white", "kind": "KE"}, {"owner": "white", "kind": "GI"}, {"owner": "white", "kind": "KI"}, {"owner": "white", "kind": "GY"}, {"owner": "white", "kind": "KI"}, {"owner": "white", "kind": "GI"}, {"owner": "white", "kind": "KE"}, {"owner": "white", "kind": "KY"}]
]

// [関数]与えられた配置の配列に従って盤面を生成する -> null
var createKoma = function(position) {
  // #boardのelementを取得
  var $Board = document.getElementById("board");

  // パフォーマンスのためにfragmentを使って1回のDOMアクセスにする
  // fragmentをつくる
  var komaFragment = document.createDocumentFragment();
  // fragmentに要素を入れていく
  position.forEach(function(row, colIndex) {
    row.forEach(function(cell, rowIndex) {
      // div要素を生成
      var $Element = document.createElement("div");
      // cellクラスを付与
      $Element.classList.add("cell");
      // セルIDを付与
      $Element.id = "cell" + (colIndex * 9 + rowIndex + 1);
      // イベントリスナーを設定
      $Element.onclick = function(event) {
        komaClickHundler(event.target);
      }
      // 空のオブジェクトならそのまま追加して次のループへ
      if (!Object.keys(cell).length) {
        komaFragment.appendChild($Element);
        return;
      }
      $Element.classList.add(cell["owner"]);
      $Element.classList.add(cell["kind"]);
      komaFragment.appendChild($Element);
    });
  });
  // boardエレメントの子要素に追加する
  $Board.appendChild(komaFragment);
}

// [関数]駒がクリックされたときの処理
komaClickHundler = function($Element) {
  console.log([store.turn, store.isSelected, store.selectedKoma], getOwnerByElement($Element), );
  var cellId = $Element.id.substr(4);
  var coordinates = getCoordinatesById(cellId);
  if (store.isSelected) {
    var $SelectedElement = store.selectedKoma;
    $Element.className = $SelectedElement.className;
    $SelectedElement.className = "cell"
    store.isSelected = false;
    store.selectedKoma = null;
    store.changeTurn();
  } else {
    if (getOwnerByElement($Element) === store.getTurn()) {
      store.isSelected = true;
      store.selectedKoma = $Element;
      return;
    } else {
      return;
    }
  }
}

// [関数]IDから座標を取得する -> [int, int]
var getCoordinatesById = function(id) {
  var y = parseInt((id - 1) / 9) + 1;
  var x = 9 - (id - 1) % 9;
  return [x, y];
}
// [関数]座標からIDを取得する -> int
var getIdByCoordinates = function(coordinates) {
  return (coordinates[1] - 1) * 9 + (10 - coordinates[0]);
}

// [関数]要素のエレメントを引数に取り、それが先手なのか後手なのか空白なのか -> string
var getOwnerByElement = function($Element) {
  if ($Element.classList.contains("white")) {
    return "white";
  } else if ($Element.classList.contains("black")) {
    return "black";
  } else {
    return "none";
  }
}

// [関数]先手後手、駒の種類、座標を引数にとり、そのセルをその種類のコマに替える -> null
var placeKoma = function(owner, kind, coordinates) {
  var cellId = "cell" + getIdByCoordinates(coordinates);
  var $Element = document.getElementById(cellId);
  $Element.className = "cell" + " " + owner + " " + kind;
}

// 初期配置を生成
createKoma(initPosition);


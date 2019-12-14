# EmEditor で Markdown をアウトライン表示する設定

* 最大レベル : 13
* 一致した文字列を隠す/正規表現で置換する : ✓
* 正規表現 

検索                                | 置換 | 正規表現
----------------------------------- | ---- | --------
^#{1}(?!#) (.*)$                    |  $1  |    ✓
^#{2}(?!#) (.*)$                    |  $1  |    ✓
^#{3}(?!#) (.*)$                    |  $1  |    ✓
^#{4}(?!#) (.*)$                    |  $1  |    ✓
^#{5}(?!#) (.*)$                    |  $1  |    ✓
^#{6}(?!#) (.*)$                    |  $1  |    ✓
^\s{0}(\*\|\+\|-\|\d\.)(?!\*) (.*)$ |  $2  |    ✓
^\s{1}(\*\|\+\|-\|\d\.)(?!\*) (.*)$ |  $2  |    ✓
^\s{2}(\*\|\+\|-\|\d\.)(?!\*) (.*)$ |  $2  |    ✓
^\s{3}(\*\|\+\|-\|\d\.)(?!\*) (.*)$ |  $2  |    ✓
^\s{4}(\*\|\+\|-\|\d\.)(?!\*) (.*)$ |  $2  |    ✓
^\s{5}(\*\|\+\|-\|\d\.)(?!\*) (.*)$ |  $2  |    ✓
//index.html用的。進網頁就點擊畫圖的按鈕，並使用預設的資訊畫圖。
document.getElementById("draw_submit").click();


//用d3+graphviz畫圖
function draw_graph(command){
    d3.select("#graph").graphviz().renderDot(command);
}


//找arr裡的item
function search_array_item(arr, item){
    for (let i = 0; i < arr.length; i++){
        if (arr[i] == item)
            return true;
    }
    return false;
}


//刪除arr裡的item
function remove_array_item(arr, item){
    for (let i = arr.length - 1; i >= 0 ; i--){
        if (arr[i] == item){
            arr.splice(i, 1);
        }
    }
}


//把概念圖程式輸出的資料轉換成graphviz的格式
function parser_concept_file(data){
    let link_array = new Array();           //儲存兩點連接的字串
    let node_array = new Array();           //儲存概念
    let conjunction_array = new Array();    //儲存連接詞
    let split_data = data.split(/\n/g);
    for (let index in split_data){
        let line = split_data[index].replaceAll("\n", "").replaceAll("\r", "").split(/ /g);   //length=2為:(概念) (概念). length=3為:(概念) (連接詞) (概念).
        remove_array_item(line, "");
        
        for (let i = 0; i < line.length - 1; i++){
            if (!search_array_item(link_array, `${line[i]} -- ${line[i + 1]}`)){ //增加連接
                link_array.push(`${line[i]} -- ${line[i + 1]}`);
            }
        }

        for (let i = 0; i < line.length; i++){
            if (line.length == 3 && i == 1){    //增加連接詞點到conjunction_array, 要先判斷現在是否為連接詞, 否則同時判斷在不在conjunction_array會有機會連接詞加到node_array
                if (!search_array_item(conjunction_array, line[i])){
                    conjunction_array.push(line[i]);
                }
            }else if (!search_array_item(node_array, line[i])){  //若不為連接詞, 則為概念, 所以直接判斷是否在node_array即可
                node_array.push(line[i]);
            }
        }
    }

    return [link_array, node_array, conjunction_array];
}


//把data_array轉成graphviz字串
function get_grapgviz_string(data_array){
    let link_array = data_array[0];
    let node_array = data_array[1];
    let conjunction_array = data_array[2];

    //寫入畫圖字串
    let string = "graph\n{";

    for (let i = 0; i < node_array.length; i++){        //概念為circle
        string += `\n${node_array[i]} [shape=circle fixedsize=true width=1 height=1];`;
    }

    for (let i = 0; i < conjunction_array.length; i++){ //連接詞為box
        string += `\n${conjunction_array[i]} [shape=box fixedsize=true width=.5 height=.5];`;
    }

    for (let i = 0; i < link_array.length; i++){        //寫入連接
        string += `\n${link_array[i]};`;
    }

    string += "\n}";
    
    return string;
}


//上傳檔案按鈕, 由於上傳檔案格式固定, 所以直接把要做的是直接寫在後面
async function upload_file(){
    let file = document.querySelector("#html_uploader").files[0];
    await read_file(file);
    
    let element = document.getElementById("html_user_input");
    let result_string = element.value;
    let data_array = parser_concept_file(result_string);
    element.value = get_grapgviz_string(data_array);
    document.getElementById("draw_submit").click();
}


//用FileReader來讀檔
async function read_file(file) {
    let result = await new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.onload = (e) => resolve(fileReader.result);
        fileReader.readAsText(file);
    });

    let split_data = result.split(/\n/g);

    if (split_data.length != 0){
        let result_string = split_data[0];
        for (let i = 1; i < split_data.length; i++){
            if (split_data[i].length == 0 || typeof(split_data[i]) == undefined || split_data[i].split(/[,; ]/g)[0].length == 0){
                break;
            }else{
                result_string += `\n${split_data[i]}`;
            }
        }
        document.getElementById("html_user_input").value = result_string;
    }
}
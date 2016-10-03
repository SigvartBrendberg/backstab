backstabCompiler = function(backstabCode,takesInput){
	var compiled = "var stack=[];";
	if(takesInput){
		var deterministicFlag = false;
		var header = "function(input){";
		compiled += "for(var i=0;i<input.length;i++){stack.push(input[i])};";
	}
	else{
		var header = "function(){";
		var deterministicFlag = true;
	};
	//no need to support things that are not used
	var outputFlag = false;
	var additionFlag = false;
	var subtractionFlag = false;
	var multiplicationFlag = false;
	var divisionFlag = false;
	var endingFlag = false;
	var trigonometryFlag = false;
	var loopFlag = false;
	var blockFlag = false;
	var emptyStack = true;
	var literal = function(thing){
		if(
			thing === "0" ||
			thing === "1" ||
			thing === "2" ||
			thing === "3" ||
			thing === "4" ||
			thing === "5" ||
			thing === "6" ||
			thing === "7" ||
			thing === "8" ||
			thing === "9"
		){
			return true;
		}
		return false;
	};
	var optiLib = [
		[":~",""],["sS",""],["Ss",""],["tT",""],["Tt",""],["cC",""],["Cc",""],[":=","~1"],["$$",""],["$$$$",""],["@@@",""],
		[":1+$~","1+"],["1/",""],["1*",""],["0+",""],["0-",""],["1+1-",""],["1-1+",""],["12/^","v"],["1F","1"],["0F",""],["2F","2"]
	];
	var optimizeFromLibrary = function(code){
		for(var i=0;i<optiLib.length;i++){
			code = code.replace(optiLib[i][0],optiLib[i][1]);
		};
		return code;
	};
	//create a function block structure
	var subStringProcess = function(string){
		var modified = "";
		var subStrings = [];
		for(var i=0;i<string.length;i++){
			if(string[i] === "{"){
				i++;
				var sub = "";
				var nesting = 1;
				for(;i<string.length;i++){
					if(string[i] === "}"){
						nesting--;
					}
					else if(string[i] === "{"){
						nesting++;
					};
					if(!nesting){
						i++;
						break;
					};
					sub += string[i];
				};
				i--;
				subStrings.push(sub);
			}
			else{
				modified += string[i];
			};
		};
		for(var i=0;i<subStrings.length;i++){//recursion
			subStrings[i] = subStringProcess(subStrings[i]);
		};
		return {
			code:modified,
			sub:subStrings
		};
	};
	var structure = subStringProcess(backstabCode);
	if(structure.sub.length > 0){
		blockFlag = true;
	};
	//create code for all the 'simple' commands
	var parser = function(code){
		if(literal(code)){
			return "stack.push(" + code + ");";
		};
		if(code === "a"){
			return "stack.push(10);";
		};
		if(code === "h"){
			return "stack.push(100);";
		};
		if(code === "k"){
			return "stack.push(1000);";
		};
		if(code === "m"){
			return "stack.push(1000000);";
		};
		if(code === "b"){
			return "stack.push(1000000000);";
		};
		if(code === "p"){
			return "stack.push(Math.PI);";
		};
		if(code === "e"){
			return "stack.push(Math.E);";
		};
		if(code === "+"){
			additionFlag = true;
			endingFlag = true;
			return "add();";
		};
		if(code === "-"){
			subtractionFlag = true;
			endingFlag = true;
			return "sub();";
		};
		if(code === "*"){
			multiplicationFlag = true;
			endingFlag = true;
			return "mul();";
		};
		if(code === "/"){
			divisionFlag = true;
			endingFlag = true;
			return "div();";
		};
		if(code === "%"){
			endingFlag = true;
			return "change(last(1)%last(0),1);stack.pop();";
		};
		if(code === "^"){
			endingFlag = true;
			return "change(Math.pow(last(1),last(0)),1);stack.pop();";
		};
		if(code === "l"){
			endingFlag = true;
			return "change(Math.log(last(1))/Math.log(last(0)),1);stack.pop();";
		};
		if(code === "_"){
			endingFlag = true;
			return "change(Number(last(1)+\"\"+last(0)),1);stack.pop();";
		};
		if(code === "i"){
			return "stack.push(stack.length);";
		};
		if(code === "v"){
			endingFlag = true;
			return "change(Math.sqrt(last(0)),0);";
		};
		if(code === "f"){
			endingFlag = true;
			return "change(Math.floor(last(0)),0);";
		};
		if(code === "s"){
			endingFlag = true;
			trigonometryFlag = true;
			return "sin();";
		};
		if(code === "c"){
			endingFlag = true;
			trigonometryFlag = true;
			return "cos();";
		};
		if(code === "t"){
			endingFlag = true;
			trigonometryFlag = true;
			return "tan();";
		};
		if(code === "S"){
			endingFlag = true;
			trigonometryFlag = true;
			return "asi();";
		};
		if(code === "C"){
			endingFlag = true;
			trigonometryFlag = true;
			return "aco();";
		};
		if(code === "T"){
			endingFlag = true;
			trigonometryFlag = true;
			return "ata();";
		};
		if(code === "F"){
			endingFlag = true;
			return "var tmp=Math.floor(last(0));stack.pop();if(tmp&&tmp!=1){while(tmp%2===0&&tmp){stack.push(2);tmp=tmp/2};for(var j=3;j*j<=tmp;j+=2){if(tmp%j===0){stack.push(j);tmp=tmp/j;j-=2}}if(tmp!=1){stack.push(tmp)}};";
		};
		if(code === "~"){
			return "stack.pop();";
		};
		if(code === ":"){
			endingFlag = true;
			return "stack.push(last(0));";
		};
		if(code === "$"){
			endingFlag = true;
			return "var tmp=last(0);change(last(1),0);change(tmp,1);";
		};
		if(code === "."){
			endingFlag = true;
			outputFlag = true;
			return "if(last(0)===10){output+=\"<br>\"}else{output+=String.fromCharCode(last(0))};stack.pop();";
		};
	};
	//expression evaluation
	var evaluateExpression = function(expression){
		expression = optimizeFromLibrary(expression);
		var evaluated = "";
		for(var i=0;i<expression.length;i++){
			if(expression[i] === "'"){
				for(;++i<expression.length;){
					if(expression[i] === "'"){
						break;
					};
					evaluated += "stack.push(" + expression[i].charCodeAt(0) + ");";
				};
			}
			else if(expression[i] === "\""){
				var tmp = "";
				for(;literal(expression[++i]);){
					tmp += expression[i];
				};
				evaluated += "stack.push(" + tmp + ");";
				i--;
			}	
			else if(expression[i] === "("){
				endingFlag = true;
				evaluated += "if(last(0)!=0){";
				var tmpCode = "";
				var nesting = 1;
				for(;++i<expression.length;){
					if(expression[i] === ")"){
						nesting--;
					}
					else if(expression[i] === "("){
						nesting++;
					}
					else if(expression[i] === "|" && nesting === 1){
						evaluated += evaluateExpression(tmpCode) + "}else{";
						var tmpCode2 = "";
						var nesting2 = 1;
						for(;++i<expression.length;){
							if(expression[i] === ")"){
								nesting2--;
							}
							else if(expression[i] === "("){
								nesting2++;
							}
							else{
								tmpCode2 += expression[i];
							};
							if(!nesting2){
								evaluated += evaluateExpression(tmpCode2) + "};";
								break;
							};
						};
						break;
					}
					else{
						tmpCode += expression[i];
					};
					if(!nesting){
						evaluated += evaluateExpression(tmpCode) + "};";
						break;
					};
				};
			}
			else if(expression[i] === "?"){
				endingFlag = true;
				evaluated += "if(last(0)!=0){stack.pop();" + evaluateExpression(expression[++i]) + "}else{stack.pop()};";
			}
			else if(expression[i] === "#"){
				/*repetition code*/
			}
			else if(expression[i] === "["){
				endingFlag = true;
				loopFlag = true;
				evaluated += "while(last(0)){stack.pop();";
				var tmpCode = "";
				var nesting = 1;
				for(;++i<expression.length;){
					if(expression[i] === "]"){
						nesting--;
					}
					else if(expression[i] === "["){
						nesting++;
					}
					else{
						tmpCode += expression[i];
					};
					if(!nesting){
						evaluated += evaluateExpression(tmpCode) + "};stack.pop();";
						break;
					};
				};
			}
			else if(expression[i] === "\\"){
				/*function call code*/
			}
			else if(expression[i] === ";"){
				/*stop execution code*/
			}
			else{
				evaluated += parser(expression[i]);
			};
		};
		return evaluated;
	};
	//set up a function scheme
	var functionScheme = function(functionObject){
		var callableCode = "";
		if(functionObject.sub.length > 0){
			callableCode += "var functions=[";
			for(var i=0;i<functionObject.sub.length;i++){
				callableCode += "function(){" + functionScheme(functionObject.sub[i]) + "},";
			};
			callableCode += "];";
		};
		callableCode += evaluateExpression(functionObject.code);
		return callableCode;
	};
	compiled += functionScheme(structure);
	if(outputFlag){
		compiled += "return output+stack};";
		header += "var output=\"\";";
	}
	else{
		compiled += "return \"\"+stack};";
	};
	if(endingFlag){
		header += "var last=function(index){return stack[stack.length-index-1]};var change=function(value,index){stack[stack.length-index-1]=value};";
	};
	if(additionFlag){
		header += "var add=function(){if(stack.length!=1){change(last(1)+last(0),1);stack.pop()}};";
	};
	if(subtractionFlag){
		header += "var sub=function(){if(stack.length===1){stack[0]=-stack[0]}else{change(last(1)-last(0),1);stack.pop()}};";
	};
	if(multiplicationFlag){
		header += "var mul=function(){change(last(1)*last(0),1);stack.pop()};";
	};
	if(divisionFlag){
		header += "var div=function(){change(last(1)/last(0),1);stack.pop()};";
	};
	if(trigonometryFlag){
		header += "var sin=function(){change(Math.sin(last(0)),0)};var cos=function(){change(Math.cos(last(0)),0)};var tan=function(){change(Math.tan(last(0)),0)};var asi=function(){change(Math.asin(last(0)),0)};var aco=function(){change(Math.acos(last(0)),0)};var ata=function(){change(Math.atan(last(0)),0)};";
	};
	compiled = header + compiled;
	var postOpti = [
		[/stack\.push\([0-9]+\)\;stack\.pop\(\)\;/,""]
	];
	for(var i=0;i<postOpti.length;i++){
		compiled = compiled.replace(postOpti[i][0],postOpti[i][1]);
	};
	if(deterministicFlag && loopFlag === false && blockFlag === false){//agressive compiling when the output is constant
		//this part is basically just a simplified version of the interpreter, to obtain constant output
		var backstabInterpret = function(code){
			var output = "";
			var string = code;
			var stack = [];
			var last = function(index){
				return stack[stack.length-index-1];
			};
			var change = function(value,index){
				stack[stack.length-index-1] = value;
			};
			var longMode = false;
			for(var i=0;true;){
				if(longMode){
					if(literal(string[i])){
						if(stack.length != 0){
							change(Number(last(0) + "" + string[i]),0);
						}
						else{
							stack.push(Number(string[i]));
						};
					}
					else{
						longMode = false;
						continue;
					};
				}
				else if(literal(string[i])){
					stack.push(Number(string[i]));
				}
				else if(string[i] === "\""){
					longMode = true;
					i++;
					if(i<string.length){
						stack.push(Number(string[i]));
					};
				}
				else if(string[i] === "'"){
					for(;string[++i] != "'" && i < string.length;){
						stack.push(string[i].charCodeAt(0));
					};
				}
				else if(string[i] === "+"){
					if(stack.length != 1){
						change(last(1)+last(0),1);
						stack.pop();
					};
				}
				else if(string[i] === "-"){
					if(stack.length === 1){
						stack[0] = -stack[0];
					}
					else{
						change(last(1)-last(0),1);
						stack.pop();
					};
				}
				else if(string[i] === "*"){
					change(last(1)*last(0),1);
					stack.pop();
				}
				else if(string[i] === "/"){
					change(last(1)/last(0),1);
					stack.pop();
				}
				else if(string[i] === "%"){
					change(last(1)%last(0),1);
					stack.pop();
				}
				else if(string[i] === "^"){
					change(Math.pow(last(1),last(0)),1);
					stack.pop();
				}
				else if(string[i] === "l"){
					change(Math.log(last(1))/Math.log(last(0)),1);
					stack.pop();
				}
				else if(string[i] === "_"){
					change(Number(last(1)+""+last(0)),1);
					stack.pop();
				}
				else if(string[i] === "i"){
					stack.push(stack.length);
				}
				else if(string[i] === "p"){
					stack.push(Math.PI);
				}
				else if(string[i] === "e"){
					stack.push(Math.E);
				}
				else if(string[i] === "a"){
					stack.push(10);
				}
				else if(string[i] === "h"){
					stack.push(100);
				}
				else if(string[i] === "k"){
					stack.push(1000);
				}
				else if(string[i] === "m"){
					stack.push(1000000);
				}
				else if(string[i] === "b"){
					stack.push(1000000000);
				}
				else if(string[i] === "v"){
					change(Math.sqrt(last(0)),0);
				}
				else if(string[i] === "f"){
					change(Math.floor(last(0)),0);
				}
				else if(string[i] === "!"){
					change(Math.floor(last(0)),0);//autofloor
					var produkt = 1;
					for(var j=2;j<=last(0);j++){
						produkt*=j;
					};
					change(produkt,0);
				}
				else if(string[i] === "q"){
					stack.sort(function(a,b){return a-b;});
				}
				else if(string[i] === "$"){
					var tmp = last(0);
					change(last(1),0);
					change(tmp,1);
				}
				else if(string[i] === "@"){
					var tmp = last(0);
					change(last(1),0);
					change(last(2),1);
					change(tmp,2);
				}
				else if(string[i] === ":"){
					if(stack.length){
						stack.push(last(0));
					}
					else{
						stack.push(0);
						stack.push(0);
					};
				}
				else if(string[i] === "~"){
					stack.pop();
				}
				else if(string[i] === "r"){
					stack.reverse();
				}
				else if(string[i] === "s"){
					change(Math.sin(last(0)),0);
				}
				else if(string[i] === "c"){
					change(Math.cos(last(0)),0);
				}
				else if(string[i] === "t"){
					change(Math.tan(last(0)),0);
				}
				else if(string[i] === "S"){
					change(Math.asin(last(0)),0);
				}
				else if(string[i] === "C"){
					change(Math.acos(last(0)),0);
				}
				else if(string[i] === "T"){
					change(Math.atan(last(0)),0);
				}
				else if(string[i] === "?"){
					if(last(0) === 0){
						i++;
					};
					stack.pop();
				}
				else if(string[i] === "="){
					if(last(1) === last(0)){
						change(1,1);
					}
					else{
						change(0,1);
					};
					stack.pop();
				}
				else if(string[i] === ">"){
					if(last(1) > last(0)){
						change(1,1);
					}
					else{
						change(0,1);
					};
					stack.pop();
				}
				else if(string[i] === "<"){
					if(last(1) < last(0)){
						change(1,1);
					}
					else{
						change(0,1);
					};
					stack.pop();
				}
				else if(string[i] === "F"){//factorize
					var numb = Math.floor(last(0));
					stack.pop();
					if(numb && numb != 1){
						while(numb % 2 === 0 && numb){
							stack.push(2);
							numb = numb / 2;
						};
						for(var j=3;j*j <= numb;j+=2){
							if(numb % j === 0){
								stack.push(j);
								numb = numb / j;
								j -= 2;
							};
						}
						if(numb != 1){
							stack.push(numb);
						};
					};
				}
				else if(string[i] === ","){
					var tmp = "" + Math.floor(last(0));
					stack.pop();
					for(var j=0;j<tmp.length;j++){
						stack.push(Number(tmp[j]));
					};
				}
				else if(string[i] === "."){
					if(last(0) === 10){
						output += "<br>";
					}
					else{
						output += String.fromCharCode(last(0));
					};
					stack.pop();
				}
				else if(string[i] === "A"){
					change(Math.abs(last(0)),0);
				}
				else if(string[i] === "R"){
					stack.unshift(last(0));
					stack.pop();
				}
				else if(string[i] === "L"){
					stack.push(stack[0]);
					stack.shift();
				}
				else if(string[i] === ";"){
					break;
				}
				else if(string[i] === "("){
					if(last(0) === 0){
						var nesting = 1;
						for(;++i<string.length;){
							if(string[i] === ")"){
								nesting--;
							}
							else if(string[i] === "("){
								nesting++;
							}
							else if(string[i] === "|" && nesting === 1){
								break;
							};
							if(!nesting){
								break;
							};
						};
					};
					stack.pop();
				}
				else if(string[i] === "|"){
					var nesting = 1;
					for(;++i<string.length;){
						if(string[i] === ")"){
							nesting--;
						}
						else if(string[i] === "("){
							nesting++;
						};
						if(!nesting){
							break;
						};
					};
				}
				else if(string[i] === "#"){
					var repeat = Math.floor(last(0));//autofloor
					stack.pop();
					if(string[++i] === "+"){
						for(;repeat--;){
							change(last(1)+last(0),1);
							stack.pop();
						};
					}
					else if(string[i] === "-"){
						for(;repeat--;){
							change(last(1)+last(0),1);
							stack.pop();
						};
					}
					else if(string[i] === "*"){
						for(;repeat--;){
							change(last(1)*last(0),1);
							stack.pop();
						};
					}
					else if(string[i] === "_"){
						for(;repeat--;){
							change(Number(last(1)+""+last(0)),1);
							stack.pop();
						};
					}
					else if(string[i] === "."){
						for(;repeat--;){
							if(last(0) === 10){
								output += "<br>";
							}
							else{
								output += String.fromCharCode(last(0));
							};
							stack.pop();
						};
					}
					else if(literal(string[i])){
						for(;repeat--;){
							stack.push(Number(string[i]));
						};
					};
				};
				if(++i >= string.length){
					break;
				};
			};
			return output + stack;
		};
		//end of interpreter emulator
		compiled = "function(){return \"" + backstabInterpret(structure.code) + "\"};";
	};
	return compiled;
};

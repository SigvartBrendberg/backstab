backstab = function(code,input){
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
		for(var i=0;i<subStrings.length;i++){
			subStrings[i] = subStringProcess(subStrings[i]);
		};
		return {
			code:modified,
			sub:subStrings
		};
	};
	var structure = subStringProcess(code);
	var string = structure.code;
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
	var stack = [];
	for(var i=0;i<input.length;i++){
		stack.push(input[i]);
	};
	var last = function(index){
		return stack[stack.length-index-1];
	};
	var change = function(value,index){
		stack[stack.length-index-1] = value;
	};
	var callStack = [];
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
		else if(string[i] === "x"){
			stack.push(Math.random());
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
			};
		}
		else if(string[i] === "["){
			if(last(0) === 0){
				var nesting = 1;
				for(;++i<string.length;){
					if(string[i] === "]"){
						nesting--;
					}
					else if(string[i] === "["){
						nesting++;
					}
					if(!nesting){
						break;
					};
				};
			};
			stack.pop();
		}
		else if(string[i] === "]"){
			var nesting = 1;
			for(;--i;){
				if(string[i] === "]"){
					nesting++;
				}
				else if(string[i] === "["){
					nesting--;
				}
				if(!nesting){
					break;
				};
			};
			i--;
		}
		else if(string[i] === "\\"){
			callStack.push(
				{
					location:i,
					target:last(0)
				}
			);
			var where = structure;
			for(var j=0;j<callStack.length;j++){
				where = where.sub[callStack[j].target];
			};
			string = where.code;
			i = -1;
			stack.pop();
		};
		if(++i >= string.length){
			if(callStack.length === 0){
				break;
			};
			i = callStack[callStack.length-1].location+1;
			callStack.pop();
			var where = structure;
			for(var j=0;j<callStack.length;j++){
				where = where.sub[callStack[j].target];
			};
			string = where.code;
		};
	};
	return stack;
};

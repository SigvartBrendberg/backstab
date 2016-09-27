# Backstab
The Backstab programming language is a small scripting language to automate small algorithms and formulas. Programs are written on the fly, and typically just once. Its compact syntax and stack based nature makes it suitable for golfing.

If you are a programmer, I bet your favourite method for doing calculations is through code. That works great, mostly, but what if you just need to perform a small task, like adding some numbers or using a trivial formula? Then it is a little overkill to start typing #include <stdio.h> int main... Sure, that is a great thing if you can reuse it later, but for a thowaway calculation, you need something different.
That leads us to the first design principle of backstab. The program is ment to run while you are writing it. For every small change you do, for every keystroke, you can imidiately see the effect.
That must have some consequeces. Imagine what trouble such a feature would make in other languages: You have typed the opening bracket, but not the closing one yet → SYNTAX ERROR! Or, just a part of a keyword → REFERENCE ERROR!
Perhaps the most apparent difference is how you do math. Imagine you are doing something like '2+2'. By the time you have typed '2+', it is not valid, the second number is missing.
Backstab solves that problem by using Reverse Polish notation, an operator looks back to fetch its arguments. The calculation above becomes '22+', and is at no point an invalid expression. The interpreter reads it as 'push 2, push another 2, add them together'. Another great benefit of this is that no paranthesis or order of operators rules are needed.
You can make complex programs in backstab. It is not the main purpose, as big chuncks of backstab code are hard to read, but the possibility of creating function blocks {} makes it surprisingly powerful.

Backstab is still in an early phase, but most basic syntax is done. Most programs and features should work in future versions.

# Unused definitions:

#main -> instruction {% id %}
#      | data {% id %}
#      | type {% id %}
#      | parameter {% id %}
#      | storage {% id %}
#      | code {% id %}
#      | script {% id %}
#      | parameterValue {% id %}
#      | storageValue {% id %}
#      | typeData {% id %}

#parameterValue -> %parameter _ typeData _ semicolons {% singleArgKeywordToJson %}
#storageValue -> %storage _ typeData _ semicolons {% singleArgKeywordToJson %}
#typeData -> %singleArgType _ typeData {% singleArgKeywordToJson %}
#          | %lparen _ %singleArgType _ typeData _ %rparen {% singleArgKeywordWithParenToJson %}
#          | %doubleArgType _ typeData _ typeData {% doubleArgKeywordToJson %}
#          | %lparen _ %doubleArgType _ typeData _ typeData _ %rparen {% doubleArgKeywordWithParenToJson %}
#          | subTypeData {% id %}
#          | subTypeElt {% id %}
#          | %number {% intToJson %}
#          | %string {% stringToJson %}
#          | %lbrace _ %rbrace {% function(d) { return []; } %}

#subTypeData -> %lbrace _ %rbrace {% function(d) { return "[]"; } %}
#             | "{" _ (data ";":? _):+ "}" {% instructionSetToJsonSemi %}
#             | "(" _ (data ";":? _):+ ")" {% instructionSetToJsonSemi %}

#subTypeElt -> %lbrace _ %rbrace {% function(d) { return "[]"; } %}
#            | "{" _ (typeElt ";":? _):+ "}" {% instructionSetToJsonSemi %}
#            | "(" _ (typeElt ";":? _):+ ")" {% instructionSetToJsonSemi %}
#            | "{" _ (typeElt _ ";":? _):+ "}" {% instructionSetToJsonSemi %}
#            | "(" _ (typeElt _ ";":? _):+ ")" {% instructionSetToJsonSemi %}

#typeElt -> %elt _ typeData _ typeData {% doubleArgKeywordToJson %}

# subInstruction ->
#                 %lbrace _ %rbrace {% function(d) { return ""; } %}
#               | %lbrace _ instruction _ %rbrace {% function(d) { return d[2]; } %}
#               | %lbrace _ (instruction _ %semicolon _):+ instruction _ %rbrace {% function(d) { return instructionSetToJsonNoSemi(d, false); } %}
#               | %lbrace _ (instruction _ %semicolon _):+ %rbrace {% function(d) { return instructionSetToJsonSemi(d, false); } %}
#                # cases with nested {}
#               | %lbrace _ subInstruction _ semicolons _ %rbrace {% function(d) { return d[2]; } %}
#               | %lbrace _ subInstruction _ semicolons _ instruction _ %rbrace {% function(d) { return d[2].concat(d[6]); } %}
#               | %lbrace _ subInstruction _ semicolons _ (instruction _ %semicolon _):+ instruction _ %rbrace {% function(d) { return instructionSetToJsonNoSemi(d, true); } %}
#               | %lbrace _ subInstruction _ semicolons _ (instruction _ %semicolon _):+ %rbrace {% function(d) { return instructionSetToJsonSemi(d, true); } %}

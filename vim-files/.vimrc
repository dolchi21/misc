execute pathogen#infect()

syntax on

filetype plugin indent on

" autocmd FileType make set noexpandtab shiftwidth=4

set noshowmode
let g:lightline = {
	\  'active': {
	\    'left': [['mode', 'paste'], ['gitbranch', 'readonly', 'filename', 'modified']]
	\  },
	\  'component_function': { 'gitbranch': 'gitbranch#name' },
	\}
